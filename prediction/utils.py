import logging

from prediction.multi_source_provider import normalize_symbol, strip_exchange, provider_symbol, provider_exchange

logger = logging.getLogger(__name__)


def standardize_response(success=True, data=None, error=None):
    """
    Helper to create standardized API responses.
    """
    return {"success": success, "data": data, "error": error}


__all__ = ["standardize_response", "normalize_symbol", "strip_exchange", "provider_symbol", "provider_exchange"]
