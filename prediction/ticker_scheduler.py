import logging
import os
import random
import time
from typing import List

from django.db import transaction
from django.utils import timezone

from .fetch_engine import fetch_batch, fetch_live_price
from .models import MarketTickerSnapshot
from .ticker_constants import TOP_NIFTY_SYMBOLS, COMPANY_LOOKUP

logger = logging.getLogger(__name__)

FETCH_INTERVAL_SECONDS = 12 * 60 * 60  # 12 hours
LOCK_PATH = os.path.join(os.path.dirname(__file__), "..", "scheduler", ".scheduler.lock")


def _prune_history(symbols: List[str], keep: int = 50):
    """
    Keep only the most recent `keep` rows per symbol to bound storage.
    """
    for sym in symbols:
        ids_to_delete = (
            MarketTickerSnapshot.objects.filter(symbol=sym)
            .order_by("-timestamp")
            .values_list("id", flat=True)[keep:]
        )
        if ids_to_delete:
            MarketTickerSnapshot.objects.filter(id__in=list(ids_to_delete)).delete()


def fetch_and_store_once() -> int:
    """
    Fetch the configured tickers once and persist snapshots.
    Returns number of rows stored.
    """
    now = timezone.now()
    snapshots = []

    batch = fetch_batch(TOP_NIFTY_SYMBOLS, period="10d", interval="1d", portfolio="NIFTY200")
    for base_symbol in TOP_NIFTY_SYMBOLS:
        try:
            entry = batch.get(base_symbol, {})
            df = entry.get("data")
            if not entry.get("success") or df is None or getattr(df, "empty", True):
                logger.warning("Ticker fetch failed for %s: %s", base_symbol, entry.get("error"))
                continue
            price = float(df["Close"].iloc[-1])
            prev = float(df["Close"].iloc[-2]) if len(df) > 1 else price
            change_val = price - prev
            change_pct = (change_val / prev) * 100 if prev else None
            volume = int(df["Volume"].iloc[-1]) if "Volume" in df.columns else None
            snapshots.append(
                MarketTickerSnapshot(
                    symbol=base_symbol,
                    company=COMPANY_LOOKUP.get(base_symbol),
                    price=price,
                    change=change_val,
                    change_percent=change_pct,
                    volume=volume,
                    source=entry.get("source") or "twelvedata",
                    timestamp=now,
                )
            )
            logger.info("Stored snapshot candidate %s source=%s", base_symbol, entry.get("source"))
        except Exception as exc:  # noqa: BLE001
            logger.exception("Unexpected ticker fetch error for %s: %s", base_symbol, exc)

    if not snapshots:
        logger.warning("No ticker snapshots persisted in this cycle")
        return 0

    with transaction.atomic():
        MarketTickerSnapshot.objects.bulk_create(snapshots)
        _prune_history(TOP_NIFTY_SYMBOLS)

    logger.info("Stored %s ticker snapshots at %s", len(snapshots), now.isoformat())
    return len(snapshots)


def run_scheduler_forever(interval_seconds: int = FETCH_INTERVAL_SECONDS):
    """
    Long-running loop to refresh ticker data every `interval_seconds`.
    """
    # best-effort single instance guard (shared with scheduler/scheduler.py)
    try:
        lock_path = os.path.abspath(LOCK_PATH)
        fd = os.open(lock_path, os.O_CREAT | os.O_EXCL | os.O_RDWR)
        os.write(fd, str(os.getpid()).encode())
    except FileExistsError:
        logger.warning("Ticker scheduler lock present; another instance likely running. Exiting.")
        return

    logger.info("Starting ticker scheduler; interval=%ss", interval_seconds)
    while True:
        started = time.monotonic()
        fetch_and_store_once()
        elapsed = time.monotonic() - started
        sleep_for = max(interval_seconds - elapsed, 1)
        logger.info("Ticker scheduler sleeping for %.1f seconds", sleep_for)
        time.sleep(sleep_for)
