import csv
import os
from django.core.management.base import BaseCommand
from portfolio.models import Stock


class Command(BaseCommand):
    help = "Import NIFTY200 and USA200 stocks from CSV files"

    def handle(self, *args, **kwargs):
        Stock.objects.all().delete()

        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        data_dir = os.path.join(base_dir, "data")

        files = [
            ("nifty200_with_sectors.csv", "NIFTY200"),
            ("usa200_with_sectors.csv", "USA200"),
        ]

        for file_name, portfolio_name in files:
            file_path = os.path.join(data_dir, file_name)

            if not os.path.exists(file_path):
                self.stdout.write(self.style.ERROR(f"File not found: {file_path}"))
                continue

            with open(file_path, mode="r", encoding="utf-8-sig") as file:
                reader = csv.DictReader(file)

                for row in reader:
                    if portfolio_name == "NIFTY200":
                        company = row.get("Company Name", "").strip()
                        symbol = row.get("Symbol", "").strip()
                        sector = row.get("Sector", "").strip()
                        ltp = None
                        change_percent = None
                        market_cap = ""
                        high_52w = None
                        low_52w = None
                        volume = ""
                    else:
                        company = row.get("Company", "").strip()
                        symbol = row.get("Symbol", "").strip()
                        sector = row.get("Sector", "").strip()
                        ltp = self.to_float(row.get("Price"))
                        change_percent = None
                        market_cap = ""
                        high_52w = None
                        low_52w = None
                        volume = ""

                    if company and symbol and sector:
                        Stock.objects.create(
                            company=company,
                            symbol=symbol,
                            portfolio=portfolio_name,
                            sector=sector,
                            ltp=ltp,
                            change_percent=change_percent,
                            market_cap=market_cap,
                            high_52w=high_52w,
                            low_52w=low_52w,
                            volume=volume,
                        )

            self.stdout.write(self.style.SUCCESS(f"Imported {file_name} successfully"))

    def to_float(self, value):
        if value is None:
            return None
        value = str(value).replace(",", "").replace("%", "").strip()
        if value == "":
            return None
        try:
            return float(value)
        except ValueError:
            return None