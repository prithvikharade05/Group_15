import logging
import os
import random
import time
from datetime import timedelta
from typing import Any, Dict, List, Optional, Tuple

import pandas as pd
import requests
from django.utils import timezone

from .cache_manager import DiskCache, memory_cache
from .models import HistoricalPriceSeries, MarketTickerSnapshot
from .multi_source_provider import normalize_symbol, strip_exchange
from .ticker_constants import COMPANY_LOOKUP, TOP_NIFTY_SYMBOLS

logger = logging.getLogger(__name__)

API_KEY = os.getenv("TWELVEDATA_API_KEY", "")
TIME_SERIES_URL = "https://api.twelvedata.com/time_series"
PRICE_URL = "https://api.twelvedata.com/price"

# Caching / rate limits
SUCCESS_TTL = 600  # 10 minutes in-memory
HIST_DB_TTL_HOURS = 12
LIVE_DB_TTL_HOURS = 12
MIN_CALL_INTERVAL = 1.0  # seconds between outbound calls
DISK_CACHE = DiskCache(os.path.join(os.path.dirname(__file__), "models", "data_cache"))

SESSION_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
}


class ExternalCallGate:
    """
    Very small global gate to make TwelveData usage human-paced.
    """

    def __init__(self, min_interval: float = MIN_CALL_INTERVAL):
        self.min_interval = min_interval
        self._last_call = 0.0

    def wait(self):
        now = time.time()
        wait_for = max(0.0, (self._last_call + self.min_interval) - now)
        if wait_for > 0:
            time.sleep(wait_for)
        self._last_call = time.time()


CALL_GATE = ExternalCallGate()


def _session_with_headers(session: Optional[requests.Session] = None, proxy: Optional[str] = None) -> requests.Session:
    if session:
        return session
    s = requests.Session()
    s.headers.update(SESSION_HEADERS)
    if proxy:
        s.proxies = {"http": proxy, "https": proxy}
    return s


def _period_to_outputsize(period: str) -> int:
    """
    Map yfinance-style period strings to TwelveData outputsize.
    Defaults to ~1 year if unknown.
    """
    period = (period or "").lower()
    if period.endswith("d") and period[:-1].isdigit():
        return int(period[:-1]) + 2
    if period.endswith("mo") and period[:-2].isdigit():
        return int(period[:-2]) * 22
    if period in ("max", "all"):
        return 5000
    if period.endswith("y") and period[:-1].isdigit():
        return int(period[:-1]) * 250
    return 260


def _map_interval(interval: str) -> str:
    if interval in ("1d", "1day"):
        return "1day"
    if interval in ("1h", "60m"):
        return "1h"
    if interval in ("30m",):
        return "30min"
    return interval


def _df_from_values(values: List[Dict[str, Any]]) -> Optional[pd.DataFrame]:
    if not values:
        return None
    try:
        df = pd.DataFrame(values)
        rename_map = {
            "datetime": "Date",
            "open": "Open",
            "high": "High",
            "low": "Low",
            "close": "Close",
            "volume": "Volume",
        }
        df.rename(columns=rename_map, inplace=True)
        if "Date" not in df.columns:
            return None
        df["Date"] = pd.to_datetime(df["Date"])
        df.sort_values("Date", inplace=True)
        df.set_index("Date", inplace=True)
        numeric_cols = ["Open", "High", "Low", "Close", "Volume"]
        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")
        return df
    except Exception as exc:  # noqa: BLE001
        logger.warning("Failed to convert values to DataFrame: %s", exc)
        return None


def _serialize_df(df: pd.DataFrame) -> list:
    safe_df = df.copy()
    safe_df = safe_df.reset_index()
    safe_df["Date"] = safe_df["Date"].dt.strftime("%Y-%m-%d %H:%M:%S")
    return safe_df.to_dict(orient="records")


def _load_series_from_db(symbol_base: str, interval: str, max_age_hours: int) -> Tuple[Optional[pd.DataFrame], bool]:
    cutoff = timezone.now() - timedelta(hours=max_age_hours)
    row = (
        HistoricalPriceSeries.objects.filter(symbol=symbol_base, interval=interval)
        .order_by("-fetched_at")
        .first()
    )
    if not row:
        return None, False
    is_fresh = row.fetched_at >= cutoff
    df = _df_from_values(row.data)
    return df, is_fresh


def _store_series(symbol_base: str, interval: str, df: pd.DataFrame, source: str = "twelvedata"):
    if df is None or df.empty:
        return
    try:
        payload = _serialize_df(df)
        HistoricalPriceSeries.objects.update_or_create(
            symbol=symbol_base,
            interval=interval,
            defaults={
                "start_date": df.index.min().date(),
                "end_date": df.index.max().date(),
                "data": payload,
                "source": source,
                "fetched_at": timezone.now(),
            },
        )
    except Exception:  # noqa: BLE001
        logger.warning("Failed to persist series for %s", symbol_base)


def _call_time_series(symbols: List[str], interval: str, outputsize: int, session: requests.Session) -> Dict[str, Any]:
    if not API_KEY:
        logger.error("TWELVEDATA_API_KEY missing")
        return {}

    joined = ",".join(symbols)
    CALL_GATE.wait()
    resp = session.get(
        TIME_SERIES_URL,
        params={
            "symbol": joined,
            "interval": interval,
            "outputsize": outputsize,
            "apikey": API_KEY,
        },
        timeout=10,
    )
    try:
        data = resp.json()
    except Exception:
        logger.warning("Non-JSON response from TwelveData: %s", resp.text[:200])
        return {}

    if isinstance(data, dict) and "status" in data and data.get("status") == "error":
        logger.warning("TwelveData error: %s", data)
        return {}

    # Single-symbol response returns the payload directly
    if isinstance(data, dict) and "values" in data:
        return {symbols[0]: data}

    # Multi-symbol response keyed by symbol
    if isinstance(data, dict):
        return {k: v for k, v in data.items() if isinstance(v, dict)}

    return {}


def fetch_historical(symbol: str, period: str = "60d", interval: str = "1d", portfolio: str = "NIFTY200") -> Dict[str, Any]:
    """
    Fetch historical OHLCV using TwelveData with DB-first caching.
    """
    interval_td = _map_interval(interval)
    normalized = normalize_symbol(symbol, portfolio)
    base_symbol = strip_exchange(normalized)
    mem_key = f"hist:{base_symbol}:{interval_td}"

    cached = memory_cache.get(mem_key)
    if cached is not None:
        if memory_cache.is_fail(cached):
            return {"success": False, "data": None, "error": cached.get("__fail__"), "source": "cached_fail"}
        return {"success": True, "data": cached, "error": None, "source": "cache"}

    db_df, db_fresh = _load_series_from_db(base_symbol, interval_td, HIST_DB_TTL_HOURS)
    if db_df is not None and db_fresh:
        memory_cache.set(mem_key, db_df, ttl=SUCCESS_TTL)
        return {"success": True, "data": db_df, "error": None, "source": "db"}

    session = _session_with_headers()
    outputsize = _period_to_outputsize(period)
    api_payload = _call_time_series([normalized], interval_td, outputsize, session)
    df = None
    if api_payload:
        raw = api_payload.get(normalized) or api_payload.get(base_symbol)
        if raw and "values" in raw:
            df = _df_from_values(raw.get("values"))

    if df is not None and not df.empty:
        _store_series(base_symbol, interval_td, df, source="twelvedata")
        memory_cache.set(mem_key, df, ttl=SUCCESS_TTL)
        try:
            DISK_CACHE.set(mem_key, _serialize_df(df))
        except Exception:
            pass
        return {"success": True, "data": df, "error": None, "source": "twelvedata"}

    if db_df is not None:
        # serve stale DB as fallback
        memory_cache.set(mem_key, db_df, ttl=SUCCESS_TTL)
        return {"success": True, "data": db_df, "error": "stale_db", "source": "db_stale"}

    disk = DISK_CACHE.get(mem_key)
    if disk:
        try:
            disk_df = _df_from_values(disk)
        except Exception:
            disk_df = None
        if disk_df is not None and not disk_df.empty:
            return {"success": True, "data": disk_df, "error": "disk_fallback", "source": "disk"}

    memory_cache.set_fail(mem_key, "historical_unavailable")
    return {"success": False, "data": None, "error": "historical_unavailable", "source": None}


def _calculate_price_fields(df: pd.DataFrame) -> Dict[str, Any]:
    price = prev_close = change = change_pct = volume = None
    if df is not None and not df.empty and "Close" in df.columns:
        price = float(df["Close"].iloc[-1])
        prev_close = float(df["Close"].iloc[-2]) if len(df) > 1 else price
        change = price - prev_close
        change_pct = (change / prev_close) * 100 if prev_close else 0
        if "Volume" in df.columns:
            try:
                volume = int(df["Volume"].iloc[-1])
            except Exception:
                volume = None
    return {
        "price": price,
        "prev_close": prev_close,
        "change": change,
        "change_pct": change_pct,
        "volume": volume,
    }


def fetch_live_price(symbol: str, portfolio: str = "NIFTY200", session: Optional[requests.Session] = None) -> Dict[str, Any]:
    """
    Live price derived from the latest OHLCV slice (no direct frontend API hits).
    Always persists MarketTickerSnapshot for DB-first reads.
    """
    normalized = normalize_symbol(symbol, portfolio)
    base_symbol = strip_exchange(normalized)
    mem_key = f"live:{base_symbol}"

    cached = memory_cache.get(mem_key)
    if cached is not None:
        if memory_cache.is_fail(cached):
            return {"success": False, "data": None, "error": cached.get("__fail__"), "source": "cached_fail"}
        return {"success": True, "data": cached, "error": None, "source": cached.get("source", "cache")}

    cutoff = timezone.now() - timedelta(hours=LIVE_DB_TTL_HOURS)
    latest = (
        MarketTickerSnapshot.objects.filter(symbol=base_symbol, timestamp__gte=cutoff)
        .order_by("-timestamp")
        .first()
    )
    if latest:
        payload = {
            "symbol": latest.symbol,
            "price": float(latest.price) if latest.price is not None else None,
            "prev_close": None,
            "change": float(latest.change) if latest.change is not None else None,
            "change_pct": float(latest.change_percent) if latest.change_percent is not None else None,
            "volume": latest.volume,
            "source": latest.source or "db",
        }
        memory_cache.set(mem_key, payload, ttl=SUCCESS_TTL)
        return {"success": True, "data": payload, "error": None, "source": "db"}

    hist = fetch_historical(symbol=base_symbol, period="10d", interval="1d", portfolio=portfolio)
    df = hist.get("data")
    if hist.get("success") and df is not None and not df.empty:
        fields = _calculate_price_fields(df)
        payload = {
            "symbol": base_symbol,
            **fields,
            "source": "twelvedata",
        }
        try:
            MarketTickerSnapshot.objects.create(
                symbol=base_symbol,
                company=COMPANY_LOOKUP.get(base_symbol),
                price=fields.get("price"),
                change=fields.get("change"),
                change_percent=fields.get("change_pct"),
                volume=fields.get("volume"),
                source="twelvedata",
                timestamp=timezone.now(),
            )
        except Exception:  # noqa: BLE001
            logger.warning("Failed to store ticker snapshot for %s", base_symbol)
        memory_cache.set(mem_key, payload, ttl=SUCCESS_TTL)
        return {"success": True, "data": payload, "error": None, "source": "twelvedata"}

    stale = (
        MarketTickerSnapshot.objects.filter(symbol=base_symbol)
        .order_by("-timestamp")
        .first()
    )
    if stale:
        payload = {
            "symbol": stale.symbol,
            "price": float(stale.price) if stale.price is not None else None,
            "prev_close": None,
            "change": float(stale.change) if stale.change is not None else None,
            "change_pct": float(stale.change_percent) if stale.change_percent is not None else None,
            "volume": stale.volume,
            "source": "db_stale",
        }
        return {"success": True, "data": payload, "error": "stale_db", "source": "db_stale"}

    memory_cache.set_fail(mem_key, "live_unavailable")
    return {"success": False, "data": None, "error": "live_unavailable", "source": None}


def smart_fetch(symbol: str, portfolio: str = "NIFTY200") -> Dict[str, Any]:
    return fetch_live_price(symbol, portfolio=portfolio)


def fetch_batch(symbols: List[str], period: str = "5d", interval: str = "1d", portfolio: str = "NIFTY200") -> Dict[str, Dict[str, Any]]:
    """
    Batch historical fetch with TwelveData, DB-first.
    Returns mapping raw_symbol -> result dict.
    """
    results: Dict[str, Dict[str, Any]] = {}
    normalized_map: Dict[str, str] = {}

    for raw in symbols:
        norm = normalize_symbol(raw, portfolio)
        normalized_map[norm] = raw

    interval_td = _map_interval(interval)
    outputsize = _period_to_outputsize(period)
    session = _session_with_headers()

    norm_list = list(normalized_map.keys())
    chunk_size = 25

    for i in range(0, len(norm_list), chunk_size):
        chunk = norm_list[i : i + chunk_size]

        # First try DB for each symbol
        remaining = []
        for norm in chunk:
            raw = normalized_map[norm]
            base = strip_exchange(norm)
            db_df, db_fresh = _load_series_from_db(base, interval_td, HIST_DB_TTL_HOURS)
            if db_df is not None and db_fresh:
                results[raw] = {"success": True, "data": db_df, "error": None, "source": "db"}
            else:
                remaining.append(norm)

        if not remaining:
            continue

        api_payload = _call_time_series(remaining, interval_td, outputsize, session)
        time.sleep(random.uniform(0.5, 1.0))

        for norm in remaining:
            raw = normalized_map[norm]
            base = strip_exchange(norm)
            body = api_payload.get(norm) or api_payload.get(base)
            df = None
            if body and "values" in body:
                df = _df_from_values(body.get("values"))
            if df is not None and not df.empty:
                _store_series(base, interval_td, df, source="twelvedata")
                memory_cache.set(f"hist:{base}:{interval_td}", df, ttl=SUCCESS_TTL)
                results[raw] = {"success": True, "data": df, "error": None, "source": "twelvedata"}
            else:
                # fallback to stale DB if present
                db_df, _ = _load_series_from_db(base, interval_td, 10_000)
                if db_df is not None:
                    results[raw] = {"success": True, "data": db_df, "error": "stale_db", "source": "db_stale"}
                else:
                    results[raw] = {"success": False, "data": None, "error": "no_data", "source": None}

    return results
