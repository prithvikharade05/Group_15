import logging
import os
import json
import time
from typing import List, Dict

import pandas as pd
import requests
import yfinance as yf

from prediction.cache import global_cache

logger = logging.getLogger(__name__)

DATA_CACHE_DIR = os.path.join(os.path.dirname(__file__), "models", "data_cache")


def _load_fallback(symbol: str):
    """
    Try to load cached JSON fallback data for a symbol.
    """
    normalized = symbol.upper().replace(".", "_")
    fname = f"{normalized}.json"
    path = os.path.join(DATA_CACHE_DIR, fname)
    if not os.path.exists(path):
        return None
    try:
        with open(path, "r") as f:
            raw = json.load(f)
        df = pd.DataFrame(raw)
        if "Date" in df.columns:
            df["Date"] = pd.to_datetime(df["Date"])
            df.set_index("Date", inplace=True)
        return df if not df.empty else None
    except Exception as exc:
        logger.warning("Fallback cache read failed for %s: %s", symbol, exc)
        return None


def _cache_key(symbol: str, period: str, interval: str):
    return f"{symbol}:{period}:{interval}"


def safe_fetch(symbol, period="5d", interval="1d", retries: int = 3, delay: float = 0.5):
    """
    Resilient wrapper for stock download with cache + retries.
    Always returns a dict with success flag.
    """
    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0"})

    key = _cache_key(symbol, period, interval)
    cached = global_cache.get(key)
    if cached is not None:
        return {"success": True, "data": cached, "error": None, "source": "cache"}

    last_err = None
    for attempt in range(1, retries + 1):
        try:
            data = yf.download(
                symbol,
                period=period,
                interval=interval,
                progress=False,
                threads=False,
                session=session,
            )
            if data is not None and not data.empty:
                global_cache.set(key, data)
                return {"success": True, "data": data, "error": None, "source": "live"}
            last_err = "no_data"
            logger.warning("No data for %s (attempt %s)", symbol, attempt)
        except Exception as exc:
            last_err = str(exc)
            logger.warning("Fetch error for %s (attempt %s): %s", symbol, attempt, exc)
        time.sleep(delay * attempt)

    fallback = _load_fallback(symbol)
    if fallback is not None:
        global_cache.set(key, fallback)
        return {"success": True, "data": fallback, "error": last_err or "fallback_used", "source": "fallback"}

    return {"success": False, "data": None, "error": last_err or "unknown_error", "source": None}


def fetch_batch(symbols: List[str], period="5d", interval="1d") -> Dict[str, dict]:
    """
    Batch download for multiple symbols with cache + fallback.
    Returns mapping of symbol -> {success, data, error, source}
    """
    results = {}
    to_fetch = []
    for sym in symbols:
        key = _cache_key(sym, period, interval)
        cached = global_cache.get(key)
        if cached is not None:
            results[sym] = {"success": True, "data": cached, "error": None, "source": "cache"}
        else:
            to_fetch.append(sym)

    if to_fetch:
        session = requests.Session()
        session.headers.update({"User-Agent": "Mozilla/5.0"})
        try:
            data = yf.download(
                to_fetch,
                period=period,
                interval=interval,
                progress=False,
                threads=False,
                group_by="ticker",
                session=session,
            )
        except Exception as exc:
            logger.error("Batch fetch failed: %s", exc)
            data = None

        for sym in to_fetch:
            try:
                sym_df = None
                if data is not None and not data.empty:
                    if isinstance(data.columns, pd.MultiIndex):
                        if sym in data.columns.get_level_values(1):
                            sym_df = data.xs(sym, level=1, axis=1)
                    else:
                        sym_df = data
                if sym_df is not None and not sym_df.empty:
                    global_cache.set(_cache_key(sym, period, interval), sym_df)
                    results[sym] = {"success": True, "data": sym_df, "error": None, "source": "live"}
                    continue
            except Exception as exc:
                logger.warning("Batch parse fail for %s: %s", sym, exc)

            fallback = _load_fallback(sym)
            if fallback is not None:
                global_cache.set(_cache_key(sym, period, interval), fallback)
                results[sym] = {"success": True, "data": fallback, "error": "fallback_used", "source": "fallback"}
            else:
                results[sym] = {"success": False, "data": None, "error": "no_data", "source": None}

    return results


def standardize_response(success=True, data=None, error=None):
    """
    Helper to create standardized API responses.
    """
    return {
        "success": success,
        "data": data,
        "error": error
    }
