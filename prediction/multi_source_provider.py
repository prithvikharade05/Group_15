import os
import logging
from typing import Optional, Dict, Any
import requests
import yfinance as yf
import pandas as pd

logger = logging.getLogger(__name__)

TWELVEDATA_KEY = os.getenv("TWELVEDATA_API_KEY", "")
ALPHAVANTAGE_KEY = os.getenv("ALPHAVANTAGE_API_KEY", "")


def fetch_yfinance_fast(symbol: str, session: Optional[requests.Session] = None) -> Optional[Dict[str, Any]]:
    try:
        ticker = yf.Ticker(symbol, session=session) if session else yf.Ticker(symbol)
        fast = getattr(ticker, "fast_info", {}) or {}
        info = getattr(ticker, "info", {}) or {}
        price = fast.get("last_price") or info.get("currentPrice")
        prev = fast.get("previous_close") or info.get("previousClose")
        volume = fast.get("volume") or info.get("volume")
        if price is None:
            return None
        change = price - prev if prev else 0
        change_pct = (change / prev) * 100 if prev else 0
        return {
            "symbol": symbol,
            "price": float(price),
            "prev_close": float(prev) if prev else None,
            "change": float(change),
            "change_pct": float(change_pct),
            "volume": int(volume) if volume is not None else None,
            "source": "yfinance",
        }
    except Exception as exc:
        logger.debug("yfinance fast failed for %s: %s", symbol, exc)
        return None


def fetch_twelvedata(symbol: str, session: Optional[requests.Session] = None) -> Optional[Dict[str, Any]]:
    if not TWELVEDATA_KEY:
        return None
    try:
        client = session or requests
        resp = client.get(
            "https://api.twelvedata.com/quote",
            params={"symbol": symbol, "apikey": TWELVEDATA_KEY},
            timeout=5,
        )
        data = resp.json()
        if "price" not in data:
            return None
        price = float(data.get("price"))
        prev = float(data.get("previous_close")) if data.get("previous_close") else None
        change = price - prev if prev else 0
        change_pct = (change / prev) * 100 if prev else 0
        return {
            "symbol": symbol,
            "price": price,
            "prev_close": prev,
            "change": change,
            "change_pct": change_pct,
            "volume": None,
            "source": "twelvedata",
        }
    except Exception as exc:
        logger.debug("TwelveData failed for %s: %s", symbol, exc)
        return None


def fetch_alphavantage(symbol: str, session: Optional[requests.Session] = None) -> Optional[Dict[str, Any]]:
    if not ALPHAVANTAGE_KEY:
        return None
    try:
        client = session or requests
        resp = client.get(
            "https://www.alphavantage.co/query",
            params={"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": ALPHAVANTAGE_KEY},
            timeout=5,
        )
        data = resp.json().get("Global Quote", {})
        if "05. price" not in data:
            return None
        price = float(data.get("05. price"))
        prev = float(data.get("08. previous close")) if data.get("08. previous close") else None
        change = price - prev if prev else 0
        change_pct = (change / prev) * 100 if prev else 0
        return {
            "symbol": symbol,
            "price": price,
            "prev_close": prev,
            "change": change,
            "change_pct": change_pct,
            "volume": None,
            "source": "alphavantage",
        }
    except Exception as exc:
        logger.debug("AlphaVantage failed for %s: %s", symbol, exc)
        return None


def normalize_symbol(symbol: str, portfolio: str = "NIFTY200") -> str:
    sym = symbol.upper()
    if sym.startswith("^"):  # index symbols pass through
        return sym
    if portfolio == "NIFTY200" and not sym.endswith(".NS"):
        return f"{sym}.NS"
    return sym


def df_from_disk_json(records):
    df = pd.DataFrame(records)
    if "Date" in df.columns:
        df["Date"] = pd.to_datetime(df["Date"])
        df.set_index("Date", inplace=True)
    return df
