from prediction.models.arima import run_arima_forecast
from prediction.models.lstm import run_cnn_lstm_forecast
from prediction.models.regression import run_regression_forecast
from prediction.models.clustering import run_clustering_engine
from .models import Stock, MarketSnapshot, StockSnapshot
from prediction.fetch_engine import fetch_batch
from django.utils import timezone
from datetime import timedelta


def portfolio_analysis_engine(stocks):

    portfolio_results = []

    for stock in stocks:

        # 🔥 SAFE EXECUTION (VERY IMPORTANT)
        try:
            arima_result = run_arima_forecast(stock)
        except Exception as e:
            arima_result = {"success": False, "error": str(e)}

        try:
            lstm_result = run_cnn_lstm_forecast(stock)
        except Exception as e:
            lstm_result = {"success": False, "error": str(e)}

        try:
            regression_result = run_regression_forecast(stock)
        except Exception as e:
            regression_result = {"success": False, "error": str(e)}

        portfolio_results.append({
            "symbol": stock,
            "arima": arima_result,
            "lstm": lstm_result,
            "regression": regression_result
        })

    # 🔥 CLUSTERING (RUN ON FULL LIST)
    try:
        cluster_result = run_clustering_engine(stocks)
    except Exception as e:
        cluster_result = {"success": False, "error": str(e)}

    # 🔥 SUMMARY (OPTIONAL BUT POWERFUL)
    summary = {
        "total_stocks": len(stocks),
        "models_used": ["ARIMA", "LSTM", "Regression", "Clustering"]
    }

    return {
        "success": True,
        "portfolio": portfolio_results,
        "clusters": cluster_result,
        "summary": summary
    }


def safe_round(val, digits=2):
    """
    Safely round numeric values; return None if not a valid number.
    """
    try:
        return round(float(val), digits) if val is not None else None
    except (TypeError, ValueError):
        return None


def format_symbol(symbol, portfolio):
    if portfolio == "NIFTY200":
        return f"{symbol}.NSE"
    elif portfolio == "USA200":
        return symbol
    return symbol


def fetch_sector_live_data(sector_name, portfolio):
    """
    Fetch live metrics for all stocks belonging to a sector using TwelveData.
    - DB-first: return cached snapshot if fresher than 12h
    - On miss: fetch once, persist MarketSnapshot + StockSnapshot, update Stock rows
    """
    now = timezone.now()
    cutoff = now - timedelta(hours=12)
    company_map = {s.symbol: s.company for s in Stock.objects.filter(sector=sector_name, portfolio=portfolio)}
    recent = (
        MarketSnapshot.objects.filter(sector=sector_name, portfolio=portfolio, timestamp__gte=cutoff)
        .order_by("-timestamp")
        .first()
    )

    if recent:
        rows = []
        for stock in recent.stocks.all():
            rows.append({
                "company": company_map.get(stock.symbol, stock.symbol),
                "symbol": stock.symbol,
                "ltp": safe_round(stock.ltp),
                "change": safe_round(stock.change),
                "volume": stock.volume,
                "market_cap": None,
                "high_52w": None,
                "low_52w": None,
                "source": "db",
            })
        return rows

    stocks = list(Stock.objects.filter(sector=sector_name, portfolio=portfolio).values("company", "symbol"))
    if not stocks:
        return []

    symbols = [s["symbol"] for s in stocks]
    logger.info("Sector fetch start sector=%s portfolio=%s symbols=%s", sector_name, portfolio, len(symbols))
    batch = fetch_batch(symbols, period="10d", interval="1d", portfolio=portfolio)

    results = []
    stock_snapshots = []
    for stock in stocks:
        symbol = stock["symbol"]
        company = stock.get("company")
        entry = batch.get(symbol, {})
        df = entry.get("data")
        ltp = change = volume = None
        if entry.get("success") and df is not None and not getattr(df, "empty", True):
            ltp = float(df["Close"].iloc[-1])
            prev = float(df["Close"].iloc[-2]) if len(df) > 1 else ltp
            change_val = ltp - prev
            change = round((change_val / prev) * 100, 2) if prev else None
            if "Volume" in df.columns:
                try:
                    volume = int(df["Volume"].iloc[-1])
                except Exception:
                    volume = None
        results.append({
            "company": company,
            "symbol": symbol,
            "ltp": ltp,
            "change": change,
            "volume": volume,
            "market_cap": None,
            "high_52w": None,
            "low_52w": None,
            "source": entry.get("source"),
            "error": entry.get("error"),
        })
        stock_snapshots.append(StockSnapshot(
            snapshot=None,  # placeholder; set after snapshot creation
            symbol=symbol,
            ltp=ltp,
            change=change,
            volume=volume,
        ))

    try:
        snapshot = MarketSnapshot.objects.create(sector=sector_name, portfolio=portfolio)
        for snap in stock_snapshots:
            snap.snapshot = snapshot
        StockSnapshot.objects.bulk_create(stock_snapshots)
        logger.info("Stored sector snapshot sector=%s portfolio=%s count=%s", sector_name, portfolio, len(stock_snapshots))
    except Exception:
        pass

    # update base Stock table for DB-first reads
    for row in results:
        Stock.objects.filter(symbol=row["symbol"], portfolio=portfolio).update(
            ltp=row.get("ltp"),
            change_percent=row.get("change"),
            volume=row.get("volume"),
        )

    return results
