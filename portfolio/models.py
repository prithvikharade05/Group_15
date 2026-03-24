from django.db import models


class Stock(models.Model):
    PORTFOLIO_CHOICES = [
        ('NIFTY200', 'NIFTY200'),
        ('USA200', 'USA200'),
    ]

    company = models.CharField(max_length=255)
    symbol = models.CharField(max_length=50)
    portfolio = models.CharField(max_length=20, choices=PORTFOLIO_CHOICES)
    sector = models.CharField(max_length=100)
    ltp = models.FloatField(null=True, blank=True)
    change_percent = models.FloatField(null=True, blank=True)
    market_cap = models.CharField(max_length=100, null=True, blank=True)
    high_52w = models.FloatField(null=True, blank=True)
    low_52w = models.FloatField(null=True, blank=True)
    volume = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.company} ({self.symbol})"