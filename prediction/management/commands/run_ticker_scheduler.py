import logging

from django.core.management.base import BaseCommand

from prediction.ticker_scheduler import fetch_and_store_once, run_scheduler_forever

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Run the 12-hour ticker snapshot scheduler (AlphaMind live ticker backend)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--once",
            action="store_true",
            help="Fetch one snapshot cycle and exit (useful for cron/manual runs).",
        )

    def handle(self, *args, **options):
        if options.get("once"):
            stored = fetch_and_store_once()
            self.stdout.write(self.style.SUCCESS(f"Stored {stored} ticker snapshots"))
            return

        self.stdout.write(self.style.WARNING("Starting continuous ticker scheduler (Ctrl+C to stop)..."))
        try:
            run_scheduler_forever()
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("Ticker scheduler stopped by user"))
        except Exception as exc:  # noqa: BLE001
            logger.exception("Scheduler crashed: %s", exc)
            raise
