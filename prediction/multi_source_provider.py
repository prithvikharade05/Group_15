import logging
from typing import Optional

from .ticker_constants import TOP_NIFTY_SYMBOLS

logger = logging.getLogger(__name__)


def normalize_symbol(symbol: str, portfolio: Optional[str] = None) -> str:
    """
    Canonical normalization (DB-facing).
    - Uppercase
    - Strip provider-specific suffixes
    - Index symbols pass through unchanged
    """
    if not symbol:
        return symbol
    sym = strip_exchange(symbol.upper().strip())
    logger.debug("Symbol normalized input=%s portfolio=%s -> %s", symbol, portfolio, sym)
    return sym


def strip_exchange(symbol: str) -> str:
    if not symbol:
        return symbol
    sym = symbol.upper()
    for suffix in (".NS", ".NSE", ":NSE"):
        if sym.endswith(suffix):
            return sym[: -len(suffix)]
    return sym


def provider_symbol(symbol: str, provider: str, portfolio: Optional[str] = None) -> str:
    """
    Map canonical symbol -> provider-specific format.
    provider: "twelvedata" or "yfinance".
    """
    base = normalize_symbol(symbol, portfolio)
    provider = (provider or "").lower()
    if provider == "yfinance":
        # Per deployment directive: do NOT append exchange suffix for yfinance
        return base
    # default TwelveData format
    return base


def provider_exchange(portfolio: Optional[str] = None) -> Optional[str]:
    """Infer exchange code for TwelveData from portfolio name."""
    if not portfolio:
        return None
    up = portfolio.upper()
    if up.startswith("NIFTY"):
        return "NSE"
    if up.startswith("USA"):
        return None
    return None
