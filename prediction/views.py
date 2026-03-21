from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from prediction.models.arima import run_arima_forecast, format_symbol
from prediction.models.lstm import run_cnn_lstm_forecast, convert_symbol
from prediction.models.regression import run_regression_forecast
from prediction.models.clustering import run_clustering_engine


class ARIMAPredictView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        symbol = request.data.get("symbol")
        days = request.data.get("days", 7)

        if not symbol:
            return Response({"error": "Symbol required"}, status=400)

        try:
            ticker = format_symbol(symbol)

            result = run_arima_forecast(
                ticker,   # ✅ FIXED
                forecast_days=int(days)
            )

            return Response(result)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class LSTMPredictView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        symbol = request.data.get("symbol")
        days = request.data.get("days", 5)

        if not symbol:
            return Response({"error": "Symbol required"}, status=400)

        try:
            ticker = convert_symbol(symbol)

            result = run_cnn_lstm_forecast(
                ticker,   # ✅ FIXED
                forecast_days=int(days)
            )

            return Response(result)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


class RegressionPredictView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        symbol = request.data.get("symbol")
        days = request.data.get("days", 5)

        result = run_regression_forecast(symbol, int(days))
        return Response(result)


class ClusterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        stocks = request.data.get("stocks", [])

        result = run_clustering_engine(stocks)
        return Response(result)