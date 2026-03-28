import yfinance as yf
import pandas as pd
import logging

logger = logging.getLogger(__name__)

def safe_fetch(symbol, period="5d", interval="1d"):
    """
    Safe wrapper for yfinance data fetching with error handling and fallback.
    """
    try:
        data = yf.download(symbol, period=period, interval=interval, progress=False, threads=False)
        if data is None or data.empty:
            logger.warning(f"No data found for {symbol}")
            return None
        return data
    except Exception as e:
        logger.error(f"Error fetching data for {symbol}: {str(e)}")
        return None

def standardize_response(success=True, data=None, error=None):
    """
    Helper to create standardized API responses.
    """
    return {
        "success": success,
        "data": data,
        "error": error
    }
