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
            models.Index(fields=["symbol", "-timestamp"], name="prediction_market__symbol_ts_idx"),
        ]

    def save(self, *args, **kwargs):
        # normalize symbol casing and strip exchange suffix if present
        if self.symbol:
            self.symbol = self.symbol.upper().replace(".NS", "")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.symbol} @ {self.timestamp:%Y-%m-%d %H:%M:%S}"
