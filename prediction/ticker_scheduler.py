import logging
import random
import time
from typing import List

import requests
from django.db import transaction
from django.utils import timezone

from .fetch_engine import fetch_live_price
from .models import MarketTickerSnapshot
from .ticker_constants import TOP_NIFTY_SYMBOLS, COMPANY_LOOKUP

logger = logging.getLogger(__name__)

FETCH_INTERVAL_SECONDS = 15 * 60  # 15 minutes
BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Connection": "keep-alive",
}


def _build_session() -> requests.Session:
    session = requests.Session()
    session.headers.update(BROWSER_HEADERS)
    return session


def _normalize_symbol(sym: str) -> str:
    if sym.startswith("^") or sym.endswith(".NS"):
        return sym
    return f"{sym}.NS"


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
    session = _build_session()
    now = timezone.now()
    snapshots = []

    for base_symbol in TOP_NIFTY_SYMBOLS:
        normalized = _normalize_symbol(base_symbol)
        try:
            # polite pacing between requests
            time.sleep(random.uniform(0.5, 1.5))

            live = None
            for attempt in (1, 2):  # one retry max
                live = fetch_live_price(normalized, session=session)
                if live.get("success") and live.get("data"):
                    break
                if attempt == 1:
                    time.sleep(random.uniform(0.5, 1.0))

            if not live or not (live.get("success") and live.get("data")):
                logger.warning("Ticker fetch failed for %s: %s", base_symbol, live.get("error") if live else "unknown")
                continue

            info = live["data"]
            snapshots.append(
                MarketTickerSnapshot(
                    symbol=base_symbol,
                    company=COMPANY_LOOKUP.get(base_symbol),
                    price=info.get("price"),
                    change=info.get("change"),
                    change_percent=info.get("change_pct"),
                    volume=info.get("volume"),
                    source=info.get("source") or "unknown",
                    timestamp=now,
                )
            )
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
    logger.info("Starting ticker scheduler; interval=%ss", interval_seconds)
    while True:
        started = time.monotonic()
        fetch_and_store_once()
        elapsed = time.monotonic() - started
        sleep_for = max(interval_seconds - elapsed, 1)
        logger.info("Ticker scheduler sleeping for %.1f seconds", sleep_for)
        time.sleep(sleep_for)
