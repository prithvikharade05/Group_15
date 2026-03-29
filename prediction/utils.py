import logging

logger = logging.getLogger(__name__)


def standardize_response(success=True, data=None, error=None):
    """
    Helper to create standardized API responses.
    """
    return {
        "success": success,
        "data": data,
        "error": error,
    }
