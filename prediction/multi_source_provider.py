import logging
from typing import Optional

from .ticker_constants import TOP_NIFTY_SYMBOLS

logger = logging.getLogger(__name__)


def normalize_symbol(symbol: str, portfolio: Optional[str] = "NIFTY200") -> str:
    """
    Normalize to TwelveData format:
    - Indian equities get .NSE suffix
    - US symbols pass through unchanged
    """
    if not symbol:
        return symbol
    sym = symbol.upper().strip()
    sym = strip_exchange(sym)

    if sym.startswith("^"):
        return sym

    is_india = False
    if portfolio and portfolio.upper().startswith("NIFTY"):
        is_india = True
    if sym in TOP_NIFTY_SYMBOLS:
        is_india = True

    return f"{sym}.NSE" if is_india and not sym.endswith(".NSE") else sym


def strip_exchange(symbol: str) -> str:
    if not symbol:
        return symbol
    sym = symbol.upper()
    for suffix in (".NS", ".NSE", ":NSE"):
        if sym.endswith(suffix):
            return sym.replace(suffix, "")
    return sym
