import logging
from typing import Optional

from .ticker_constants import TOP_NIFTY_SYMBOLS

logger = logging.getLogger(__name__)


def normalize_symbol(symbol: str, portfolio: Optional[str] = None) -> str:
    """
    Universal normalization for TwelveData.
    - For NIFTY/NIFTY200 → append .NSE
    - Else return as-is
    """
    if not symbol:
        return symbol
    sym = strip_exchange(symbol.upper().strip())
    if sym.startswith("^"):
        logger.debug("Symbol normalized (index passthrough): %s", sym)
        return sym

    use_nse = False
    if portfolio and portfolio.upper() in {"NIFTY", "NIFTY200"}:
        use_nse = True
    if sym in TOP_NIFTY_SYMBOLS:
        use_nse = True

    normalized = f"{sym}.NSE" if use_nse and not sym.endswith(".NSE") else sym
    logger.debug("Symbol normalized input=%s portfolio=%s -> %s", symbol, portfolio, normalized)
    return normalized


def strip_exchange(symbol: str) -> str:
    if not symbol:
        return symbol
    sym = symbol.upper()
    for suffix in (".NS", ".NSE", ":NSE"):
        if sym.endswith(suffix):
            return sym[: -len(suffix)]
    return sym
