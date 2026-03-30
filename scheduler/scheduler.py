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

LOCK_PATH = os.path.join(os.path.dirname(__file__), ".scheduler.lock")


def run(interval_seconds: int = FETCH_INTERVAL_SECONDS):
    logger.info("Starting TwelveData top-ticker scheduler (interval=%ss)", interval_seconds)
    try:
        fd = os.open(LOCK_PATH, os.O_CREAT | os.O_EXCL | os.O_RDWR)
        os.write(fd, str(os.getpid()).encode())
    except FileExistsError:
        logger.warning("Scheduler already running; aborting start.")
        return
    while True:
        fetch_and_store_once()
        time.sleep(interval_seconds)


def run_once():
    return fetch_and_store_once()


if __name__ == "__main__":
    run()
