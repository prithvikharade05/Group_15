import logging
import time
from typing import List, Dict, Any, Optional
import pandas as pd
import requests
import yfinance as yf
from .cache_manager import memory_cache, DiskCache
from .multi_source_provider import (
    fetch_yfinance_fast,
    fetch_twelvedata,
    fetch_alphavantage,
    normalize_symbol,
    df_from_disk_json,
)
import os

logger = logging.getLogger(__name__)

DISK_CACHE = DiskCache(os.path.join(os.path.dirname(__file__), "models", "data_cache"))
FAIL_TTL = 60
SUCCESS_TTL = 120


def _cache_key(symbol: str, kind: str, period: str = "", interval: str = ""):
    return f"{kind}:{symbol}:{period}:{interval}"


def fetch_live_price(symbol: str, portfolio: str = "NIFTY200", session: Optional[requests.Session] = None) -> Dict[str, Any]:
    yf_symbol = normalize_symbol(symbol, portfolio)
    key = _cache_key(yf_symbol, "live")
    cached = memory_cache.get(key)
    if cached:
        if cached.get("fail"):
            return {"success": False, "error": cached["fail"], "source": "cached_fail"}
        return {"success": True, "data": cached, "error": None}

    # source chain
    for fetcher in (fetch_yfinance_fast, fetch_twelvedata, fetch_alphavantage):
        res = fetcher(yf_symbol, session=session)
        if res:
            memory_cache.set(key, res, ttl=SUCCESS_TTL)
            return {"success": True, "data": res, "error": None}

    # disk fallback (if exists)
    disk = DISK_CACHE.get(key)
    if disk:
        return {"success": True, "data": disk, "error": "disk_fallback", "source": "disk"}

    memory_cache.set(key, {"fail": "live_sources_failed"}, ttl=FAIL_TTL)
    return {"success": False, "data": None, "error": "live_sources_failed"}


def fetch_historical(symbol: str, period: str = "60d", interval: str = "1d", portfolio: str = "NIFTY200") -> Dict[str, Any]:
    yf_symbol = normalize_symbol(symbol, portfolio)
    key = _cache_key(yf_symbol, "hist", period, interval)
    cached = memory_cache.get(key)
    if cached is not None:
        if isinstance(cached, dict) and cached.get("fail"):
            return {"success": False, "data": None, "error": cached["fail"], "source": "cached_fail"}
        return {"success": True, "data": cached, "error": None, "source": "cache"}

    try:
        df = yf.download(yf_symbol, period=period, interval=interval, progress=False, threads=False)
        if df is not None and not df.empty:
            memory_cache.set(key, df, ttl=SUCCESS_TTL)
            return {"success": True, "data": df, "error": None, "source": "yfinance"}
    except Exception as exc:
        logger.warning("Historical fetch failed for %s: %s", yf_symbol, exc)

    disk = DISK_CACHE.get(key)
    if disk:
        try:
            df = df_from_disk_json(disk)
            return {"success": True, "data": df, "error": "disk_fallback", "source": "disk"}
        except Exception:
            pass

    memory_cache.set(key, {"fail": "historical_unavailable"}, ttl=FAIL_TTL)
    return {"success": False, "data": None, "error": "historical_unavailable", "source": None}


def fetch_batch(symbols: List[str], period: str = "5d", interval: str = "1d", portfolio: str = "NIFTY200") -> Dict[str, Dict[str, Any]]:
    """
    Batch fetch with cache + fallback per symbol.
    """
    yf_symbols = [normalize_symbol(s, portfolio) for s in symbols]
    results: Dict[str, Dict[str, Any]] = {}
    to_fetch = []

    for sym, raw in zip(yf_symbols, symbols):
        key = _cache_key(sym, "hist", period, interval)
        cached = memory_cache.get(key)
        if cached is not None:
            if isinstance(cached, dict) and cached.get("fail"):
                results[sym] = {"success": False, "data": None, "error": cached["fail"], "source": "cached_fail"}
            else:
                results[sym] = {"success": True, "data": cached, "error": None, "source": "cache"}
        else:
            to_fetch.append(sym)

    if to_fetch:
        try:
            data = yf.download(
                to_fetch,
                period=period,
                interval=interval,
                progress=False,
                threads=False,
                group_by="ticker",
            )
        except Exception as exc:
            logger.warning("Batch yfinance failed: %s", exc)
            data = None

        for sym in to_fetch:
            sym_df: Optional[pd.DataFrame] = None
            if data is not None and not data.empty:
                if isinstance(data.columns, pd.MultiIndex) and sym in data.columns.get_level_values(1):
                    sym_df = data.xs(sym, level=1, axis=1)
                elif not isinstance(data.columns, pd.MultiIndex):
                    sym_df = data
            if sym_df is not None and not sym_df.empty:
                memory_cache.set(_cache_key(sym, "hist", period, interval), sym_df, ttl=SUCCESS_TTL)
                results[sym] = {"success": True, "data": sym_df, "error": None, "source": "yfinance"}
            else:
                disk = DISK_CACHE.get(_cache_key(sym, "hist", period, interval))
                if disk:
                    try:
                        df = df_from_disk_json(disk)
                        results[sym] = {"success": True, "data": df, "error": "disk_fallback", "source": "disk"}
                        continue
                    except Exception:
                        pass
                memory_cache.set(_cache_key(sym, "hist", period, interval), {"fail": "no_data"}, ttl=FAIL_TTL)
                results[sym] = {"success": False, "data": None, "error": "no_data", "source": None}

    return results
