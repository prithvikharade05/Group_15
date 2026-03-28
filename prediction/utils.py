import yfinance as yf
import pandas as pd
import logging
import os
import json
import requests

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
        # Expect columns like Date, Close etc.
        if "Date" in df.columns:
            df["Date"] = pd.to_datetime(df["Date"])
            df.set_index("Date", inplace=True)
        return df if not df.empty else None
    except Exception as exc:
        logger.warning("Fallback cache read failed for %s: %s", symbol, exc)
        return None


def safe_fetch(symbol, period="5d", interval="1d"):
    """
    Safe wrapper for yfinance data fetching with error handling and fallback.
    Returns dict: {data: DataFrame or None, error: str or None, source: 'live'|'fallback'|None}
    """
    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0"})

    try:
        data = yf.download(
            symbol,
            period=period,
            interval=interval,
            progress=False,
            threads=False,
            session=session,
        )
        if data is None or data.empty:
            logger.warning("No data found for %s", symbol)
            fallback = _load_fallback(symbol)
            if fallback is not None:
                return {"data": fallback, "error": "live_empty_fallback_used", "source": "fallback"}
            return {"data": None, "error": "no_data"}
        return {"data": data, "error": None, "source": "live"}
    except Exception as e:
        logger.error("Error fetching data for %s: %s", symbol, e)
        fallback = _load_fallback(symbol)
        if fallback is not None:
            return {"data": fallback, "error": str(e), "source": "fallback"}
        return {"data": None, "error": str(e), "source": None}

def standardize_response(success=True, data=None, error=None):
    """
    Helper to create standardized API responses.
    """
    return {
        "success": success,
        "data": data,
        "error": error
    }
