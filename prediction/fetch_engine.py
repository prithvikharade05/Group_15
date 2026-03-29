import logging
import os
import random
import threading
import time
from typing import Any, Dict, List, Optional

import pandas as pd
import requests
import yfinance as yf

from .cache_manager import DiskCache, FAIL_TTL_RANGE, memory_cache
from .multi_source_provider import (
    df_from_disk_json,
    fetch_alphavantage,
    fetch_twelvedata,
    fetch_yfinance_fast,
    normalize_symbol,
)
from .proxy_manager import get_proxy, remove_bad_proxy

logger = logging.getLogger(__name__)

DISK_CACHE = DiskCache(os.path.join(os.path.dirname(__file__), "models", "data_cache"))
SUCCESS_TTL = 180  # 3 minutes
BATCH_CHUNK_SIZE = 15  # max 15-20 symbols
MIN_CALL_INTERVAL = 1.0  # seconds global spacing

SESSION_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
}


class BackoffActive(Exception):
    def __init__(self, cooldown: float):
        super().__init__(f"backoff active for {cooldown:.1f}s")
        self.cooldown = cooldown


class ExternalCallGate:
    """
    Global rate limiter with failure backoff.
    Ensures:
    - min interval between calls
    - pauses 2-5 minutes after 3 consecutive failures
    """

    def __init__(self, min_interval: float = MIN_CALL_INTERVAL):
        self.min_interval = min_interval
        self._lock = threading.Lock()
        self._last_call = 0.0
        self._block_until = 0.0
        self._failures = 0

    def before_call(self):
        with self._lock:
            now = time.time()
            if now < self._block_until:
                raise BackoffActive(self._block_until - now)
            wait = max(0.0, (self._last_call + self.min_interval) - now)
            self._last_call = now + wait
        if wait > 0:
            time.sleep(wait)

    def record_success(self):
        with self._lock:
            self._failures = 0

    def record_failure(self):
        with self._lock:
            self._failures += 1
            if self._failures >= 3:
                self._block_until = time.time() + random.uniform(*FAIL_TTL_RANGE)
                self._failures = 0


CALL_GATE = ExternalCallGate()


def _sleep_jitter():
    time.sleep(random.uniform(0.8, 1.5))


def _session_with_headers(session: Optional[requests.Session] = None, proxy: Optional[str] = None) -> requests.Session:
    if session:
        return session
    s = requests.Session()
    s.headers.update(SESSION_HEADERS)
    if proxy:
        s.proxies = {"http": f"http://{proxy}", "https": f"http://{proxy}"}
    return s


def _cache_key(symbol: str, kind: str, period: str = "", interval: str = "") -> str:
    return f"{kind}:{symbol}:{period}:{interval}"


def _cache_success(key: str, payload: Any, ttl: int = SUCCESS_TTL, persist_disk: bool = False):
    memory_cache.set(key, payload, ttl=ttl)
    if persist_disk:
        try:
            DISK_CACHE.set(key, payload)
        except Exception:
            pass


def _cache_failure(key: str, reason: str):
    memory_cache.set_fail(key, reason)


def _serialize_df(df: pd.DataFrame) -> list:
    """Make DataFrame JSON serializable for DiskCache."""
    if df is None or df.empty:
        return []
    safe_df = df.copy()
    if safe_df.index.name is None:
        safe_df = safe_df.reset_index()
    else:
        safe_df = safe_df.reset_index()
    return safe_df.to_dict(orient="records")


def _load_disk_df(raw) -> Optional[pd.DataFrame]:
    try:
        return df_from_disk_json(raw)
    except Exception:
        return None


def _make_live_df(live_data: Dict[str, Any]) -> pd.DataFrame:
    """
    Build a tiny DataFrame from live price to satisfy consumers expecting OHLC data.
    """
    now = pd.Timestamp.utcnow()
    close_val = live_data.get("price")
    vol_val = live_data.get("volume")
    df = pd.DataFrame([{"Date": now, "Close": close_val, "Volume": vol_val}])
    df["Date"] = pd.to_datetime(df["Date"])
    df.set_index("Date", inplace=True)
    return df


def fetch_live_price(symbol: str, portfolio: str = "NIFTY200", session: Optional[requests.Session] = None) -> Dict[str, Any]:
    yf_symbol = normalize_symbol(symbol, portfolio)
    key = _cache_key(yf_symbol, "live")
    cached = memory_cache.get(key)
    if cached:
        if memory_cache.is_fail(cached):
            return {"success": False, "data": None, "error": cached.get("__fail__"), "source": "cached_fail"}
        return {"success": True, "data": cached, "error": None, "source": cached.get("source", "cache")}

    session = _session_with_headers(session)
    # 1) direct attempts (yfinance fast then API fallbacks)
    for fetcher in (fetch_yfinance_fast, fetch_twelvedata, fetch_alphavantage):
        try:
            CALL_GATE.before_call()
        except BackoffActive as exc:
            logger.warning("Live price backoff active for %s (%.1fs)", yf_symbol, exc.cooldown)
            break

        _sleep_jitter()
        result = None
        try:
            result = fetcher(yf_symbol, session=session)
        except Exception as exc:  # noqa: BLE001
            logger.debug("Fetcher %s failed for %s: %s", fetcher.__name__, yf_symbol, exc)

        if result:
            CALL_GATE.record_success()
            _cache_success(key, result, ttl=SUCCESS_TTL, persist_disk=True)
            return {"success": True, "data": result, "error": None, "source": result.get("source")}
        CALL_GATE.record_failure()

    # 2) proxy-assisted yfinance attempts
    for attempt in range(3):
        proxy = get_proxy()
        if not proxy:
            break
        try:
            CALL_GATE.before_call()
        except BackoffActive as exc:
            logger.warning("Proxy live backoff active for %s (%.1fs)", yf_symbol, exc.cooldown)
            break
        _sleep_jitter()
        prox_session = _session_with_headers(None, proxy=proxy)
        try:
            result = fetch_yfinance_fast(yf_symbol, session=prox_session)
        except Exception as exc:  # noqa: BLE001
            result = None
            logger.debug("Proxy fetch failed for %s via %s: %s", yf_symbol, proxy, exc)
        if result:
            CALL_GATE.record_success()
            _cache_success(key, result, ttl=SUCCESS_TTL, persist_disk=True)
            return {"success": True, "data": result, "error": None, "source": result.get("source")}
        CALL_GATE.record_failure()
        remove_bad_proxy(proxy)

    disk = DISK_CACHE.get(key)
    if disk:
        return {"success": True, "data": disk, "error": "disk_fallback", "source": "disk"}

    _cache_failure(key, "live_sources_failed")
    return {"success": False, "data": None, "error": "live_sources_failed", "source": None}


def fetch_historical(symbol: str, period: str = "60d", interval: str = "1d", portfolio: str = "NIFTY200") -> Dict[str, Any]:
    yf_symbol = normalize_symbol(symbol, portfolio)
    key = _cache_key(yf_symbol, "hist", period, interval)
    cached = memory_cache.get(key)
    if cached is not None:
        if memory_cache.is_fail(cached):
            return {"success": False, "data": None, "error": cached.get("__fail__"), "source": "cached_fail"}
        return {"success": True, "data": cached, "error": None, "source": "cache"}

    session = _session_with_headers()
    df = None
    try:
        CALL_GATE.before_call()
        _sleep_jitter()
        df = yf.download(
            yf_symbol,
            period=period,
            interval=interval,
            progress=False,
            threads=False,
            session=session,
        )
    except BackoffActive as exc:
        logger.warning("Historical backoff active for %s (%.1fs)", yf_symbol, exc.cooldown)
    except Exception as exc:  # noqa: BLE001
        CALL_GATE.record_failure()
        logger.warning("Historical fetch failed for %s: %s", yf_symbol, exc)
    else:
        if df is not None and not df.empty:
            CALL_GATE.record_success()
            _cache_success(key, df, ttl=SUCCESS_TTL, persist_disk=False)
            # persist to disk in JSON form
            DISK_CACHE.set(key, _serialize_df(df))
            return {"success": True, "data": df, "error": None, "source": "yfinance"}
        CALL_GATE.record_failure()

    # proxy retry once for historical
    proxy = get_proxy()
    if proxy:
        try:
            CALL_GATE.before_call()
            _sleep_jitter()
            prox_session = _session_with_headers(None, proxy=proxy)
            df = yf.download(
                yf_symbol,
                period=period,
                interval=interval,
                progress=False,
                threads=False,
                session=prox_session,
            )
        except Exception as exc:  # noqa: BLE001
            df = None
            CALL_GATE.record_failure()
            remove_bad_proxy(proxy)
            logger.debug("Proxy historical failed for %s: %s", yf_symbol, exc)
        else:
            if df is not None and not df.empty:
                CALL_GATE.record_success()
                _cache_success(key, df, ttl=SUCCESS_TTL, persist_disk=False)
                DISK_CACHE.set(key, _serialize_df(df))
                return {"success": True, "data": df, "error": None, "source": "yfinance_proxy"}

    disk = DISK_CACHE.get(key)
    if disk:
        df_disk = _load_disk_df(disk)
        if df_disk is not None:
            return {"success": True, "data": df_disk, "error": "disk_fallback", "source": "disk"}

    _cache_failure(key, "historical_unavailable")
    return {"success": False, "data": None, "error": "historical_unavailable", "source": None}


def _extract_symbol_df(batch_df: Optional[pd.DataFrame], symbol: str) -> Optional[pd.DataFrame]:
    if batch_df is None or batch_df.empty:
        return None
    try:
        if isinstance(batch_df.columns, pd.MultiIndex):
            if symbol in batch_df.columns.get_level_values(1):
                return batch_df.xs(symbol, level=1, axis=1)
        else:
            return batch_df
    except Exception:
        return None
    return None


def _single_symbol_fallback(symbol: str, key: str, session: requests.Session) -> Dict[str, Any]:
    live = fetch_live_price(symbol, session=session)
    if live.get("success") and live.get("data"):
        df = _make_live_df(live["data"])
        _cache_success(key, df, ttl=SUCCESS_TTL, persist_disk=False)
        return {"success": True, "data": df, "error": "live_price_fallback", "source": live["data"].get("source")}

    disk = DISK_CACHE.get(key)
    if disk:
        df_disk = _load_disk_df(disk)
        if df_disk is not None:
            return {"success": True, "data": df_disk, "error": "disk_fallback", "source": "disk"}

    _cache_failure(key, "no_data")
    return {"success": False, "data": None, "error": live.get("error") if live else "no_data", "source": live.get("source") if live else None}


def smart_fetch(symbol: str, portfolio: str = "NIFTY200") -> Dict[str, Any]:
    """
    Alias for live price fetch with full caching + proxy fallback.
    """
    return fetch_live_price(symbol, portfolio=portfolio)


def fetch_batch(symbols: List[str], period: str = "5d", interval: str = "1d", portfolio: str = "NIFTY200") -> Dict[str, Dict[str, Any]]:
    """
    Batch fetch with cache + fallback per symbol.
    - chunked to 15 symbols
    - human-like pacing and global rate limit
    - per-symbol fallback to live price + disk cache
    """
    yf_symbols = [normalize_symbol(s, portfolio) for s in symbols]
    results: Dict[str, Dict[str, Any]] = {}
    to_fetch: List[str] = []

    for sym in yf_symbols:
        key = _cache_key(sym, "hist", period, interval)
        cached = memory_cache.get(key)
        if cached is not None:
            if memory_cache.is_fail(cached):
                results[sym] = {"success": False, "data": None, "error": cached.get("__fail__"), "source": "cached_fail"}
            else:
                results[sym] = {"success": True, "data": cached, "error": None, "source": "cache"}
        else:
            to_fetch.append(sym)

    session = _session_with_headers()

    for i in range(0, len(to_fetch), BATCH_CHUNK_SIZE):
        chunk = to_fetch[i : i + BATCH_CHUNK_SIZE]
        try:
            CALL_GATE.before_call()
        except BackoffActive as exc:
            logger.warning("Batch backoff active (%.1fs); falling back to disk/live", exc.cooldown)
            chunk = []
        else:
            _sleep_jitter()
            try:
                batch_df = yf.download(
                    chunk,
                    period=period,
                    interval=interval,
                    progress=False,
                    threads=False,
                    group_by="ticker",
                    session=session,
                )
                CALL_GATE.record_success()
            except Exception as exc:  # noqa: BLE001
                batch_df = None
                CALL_GATE.record_failure()
                logger.warning("Batch yfinance failed: %s", exc)
                # proxy retry for the same chunk
                proxy = get_proxy()
                if proxy:
                    try:
                        CALL_GATE.before_call()
                        _sleep_jitter()
                        prox_session = _session_with_headers(None, proxy=proxy)
                        batch_df = yf.download(
                            chunk,
                            period=period,
                            interval=interval,
                            progress=False,
                            threads=False,
                            group_by="ticker",
                            session=prox_session,
                        )
                        CALL_GATE.record_success()
                    except Exception as pexc:  # noqa: BLE001
                        batch_df = None
                        CALL_GATE.record_failure()
                        remove_bad_proxy(proxy)
                        logger.debug("Proxy batch failed: %s", pexc)
        # process chunk symbols
        for sym in chunk:
            key = _cache_key(sym, "hist", period, interval)
            sym_df = _extract_symbol_df(batch_df, sym)
            if sym_df is not None and not sym_df.empty:
                _cache_success(key, sym_df, ttl=SUCCESS_TTL, persist_disk=False)
                DISK_CACHE.set(key, _serialize_df(sym_df))
                results[sym] = {"success": True, "data": sym_df, "error": None, "source": "yfinance"}
            else:
                results[sym] = _single_symbol_fallback(sym, key, session=session)

    # handle any symbols skipped due to global backoff
    skipped = [s for s in to_fetch if s not in results]
    for sym in skipped:
        key = _cache_key(sym, "hist", period, interval)
        results[sym] = _single_symbol_fallback(sym, key, session=session)

    return results
