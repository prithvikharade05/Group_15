from prediction.models.arima import run_arima_forecast
from prediction.models.lstm import run_cnn_lstm_forecast
from prediction.models.regression import run_regression_forecast
from prediction.models.clustering import run_clustering_engine
from .models import Stock
import yfinance as yf


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
        return f"{symbol}.NS"
    elif portfolio == "USA200":
        return symbol
    return symbol


def fetch_sector_live_data(sector_name, portfolio):
    """
    Fetch live metrics for all stocks belonging to a sector.
    Uses yfinance's batch Tickers client for efficiency and
    returns a list of dictionaries ready for JSON serialization.
    """
    stocks = list(
        Stock.objects.filter(sector=sector_name).values("company", "symbol")
    )

    if not stocks:
        return []

    # Normalize symbols to yfinance format (append .NS when missing)
    yf_symbols = []
    symbol_map = {}
    for stock in stocks:
        raw_symbol = stock.get("symbol")
        if not raw_symbol:
            continue
        yf_symbol = format_symbol(raw_symbol, portfolio)
        symbol_map[raw_symbol] = yf_symbol
        yf_symbols.append(yf_symbol)

    tickers_client = None
    if yf_symbols:
        try:
            tickers_client = yf.Tickers(" ".join(yf_symbols))
        except Exception:
            tickers_client = None

    results = []
    for stock in stocks:
        symbol = stock.get("symbol")
        yf_symbol = symbol_map.get(symbol)
        company = stock.get("company")

        fallback = {
            "company": company,
            "symbol": symbol,
            "ltp": None,
            "change": None,
            "volume": None,
            "market_cap": None,
            "high_52w": None,
            "low_52w": None,
        }

        if not tickers_client or not yf_symbol or yf_symbol not in tickers_client.tickers:
            results.append(fallback)
            continue

        ticker_obj = tickers_client.tickers.get(yf_symbol)

        try:
            fast = getattr(ticker_obj, "fast_info", {}) or {}
            info = getattr(ticker_obj, "info", {}) or {}

            ltp = fast.get("last_price") or info.get("currentPrice")
            prev_close = fast.get("previous_close") or info.get("previousClose")

            change = None
            if ltp is not None and prev_close not in (None, 0):
                change = ((ltp - prev_close) / prev_close) * 100

            volume = fast.get("volume") or info.get("volume")
            high_52w = fast.get("year_high") or info.get("fiftyTwoWeekHigh")
            low_52w = fast.get("year_low") or info.get("fiftyTwoWeekLow")
            market_cap = info.get("marketCap")

            result_row = {
                "company": company,
                "symbol": symbol,
                "ltp": safe_round(ltp),
                "change": safe_round(change),
                "volume": volume if volume is not None else None,
                "market_cap": market_cap if market_cap is not None else None,
                "high_52w": safe_round(high_52w),
                "low_52w": safe_round(low_52w),
            }
            results.append(result_row)
        except Exception:
            results.append(fallback)

    return results
