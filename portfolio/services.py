from prediction.models.arima import run_arima_forecast
from prediction.models.lstm import run_cnn_lstm_forecast
from prediction.models.regression import run_regression_forecast
from prediction.models.clustering import run_clustering_engine


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