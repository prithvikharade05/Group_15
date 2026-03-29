from django.db import models
from django.utils import timezone


class MarketTickerSnapshot(models.Model):
    symbol = models.CharField(max_length=16, db_index=True)
    company = models.CharField(max_length=128, blank=True, null=True)
    price = models.DecimalField(max_digits=16, decimal_places=4, null=True, blank=True)
    change = models.DecimalField(max_digits=12, decimal_places=4, null=True, blank=True)
    change_percent = models.DecimalField(max_digits=8, decimal_places=4, null=True, blank=True)
    volume = models.BigIntegerField(null=True, blank=True)
    source = models.CharField(max_length=32, default="unknown")
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["symbol", "-timestamp"], name="mts_sym_ts_idx"),
        ]

    def save(self, *args, **kwargs):
        # normalize symbol casing and strip exchange suffix if present
        if self.symbol:
            self.symbol = self.symbol.upper().replace(".NS", "").replace(".NSE", "")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.symbol} @ {self.timestamp:%Y-%m-%d %H:%M:%S}"


class HistoricalPriceSeries(models.Model):
    """
    Compact DB-first cache for time-series data coming from TwelveData.
    Stores the latest slice per (symbol, interval) so all callers can
    read from DB before deciding to refresh from the API.
    """

    symbol = models.CharField(max_length=32, db_index=True)
    interval = models.CharField(max_length=16, default="1day", db_index=True)
    start_date = models.DateField()
    end_date = models.DateField()
    data = models.JSONField()  # list of {datetime, open, high, low, close, volume}
    source = models.CharField(max_length=32, default="twelvedata")
    fetched_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ["-fetched_at"]
        unique_together = ("symbol", "interval")
        indexes = [
            models.Index(fields=["symbol", "interval", "-fetched_at"], name="hps_sym_int_idx"),
        ]

    def __str__(self):
        return f"{self.symbol}:{self.interval} @ {self.fetched_at:%Y-%m-%d %H:%M:%S}"
