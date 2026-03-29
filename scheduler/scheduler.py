"""
Lightweight 12-hour scheduler for top NIFTY tickers.
- Runs outside the request path to keep frontend DB-only.
- Intended to be launched via cron/systemd or python -m scheduler.scheduler
"""

import os
import time
import logging

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from prediction.ticker_scheduler import FETCH_INTERVAL_SECONDS, fetch_and_store_once  # noqa: E402

logger = logging.getLogger(__name__)


def run(interval_seconds: int = FETCH_INTERVAL_SECONDS):
    logger.info("Starting TwelveData top-ticker scheduler (interval=%ss)", interval_seconds)
    while True:
        fetch_and_store_once()
        time.sleep(interval_seconds)


def run_once():
    return fetch_and_store_once()


if __name__ == "__main__":
    run()
