from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .services import portfolio_analysis_engine
import yfinance as yf


class PortfolioAnalysisView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        stocks = request.data.get("stocks", [])

        # 🔥 VALIDATION
        if not stocks or not isinstance(stocks, list):
            return Response({
                "success": False,
                "error": "Provide stock list like ['RELIANCE','TCS']"
            }, status=400)

        if len(stocks) < 1:
            return Response({
                "success": False,
                "error": "At least one stock required"
            }, status=400)

        # 🔥 CLEAN INPUT
        stocks = [s.upper().replace(".NS", "") for s in stocks]

        # 🔥 RUN ENGINE
        result = portfolio_analysis_engine(stocks)

        return Response(result)


# PORTFOLIO LIST
class PortfolioListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Mock portfolio data (no model yet)
        portfolio = [
            {"symbol": "RELIANCE", "name": "Reliance Industries", "quantity": 10, "avg_price": 2500},
            {"symbol": "TCS", "name": "Tata Consultancy", "quantity": 5, "avg_price": 3800}
        ]
        return Response(portfolio)


# PORTFOLIO ADD
class PortfolioAddView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        symbol = request.data.get("symbol")
        quantity = request.data.get("quantity", 1)
        avg_price = request.data.get("avg_price")

        if not symbol:
            return Response({"error": "Symbol required"}, status=400)

        try:
            # Get current price
            ticker = yf.Ticker(f"{symbol}.NS")
            info = ticker.history(period="1d")
            
            if len(info) == 0:
                return Response({"error": "Stock not found"}, status=404)
            
            current_price = info['Close'].iloc[-1]
            
            # Mock adding to portfolio (no database model yet)
            return Response({
                "success": True,
                "message": f"Added {quantity} shares of {symbol} to portfolio",
                "symbol": symbol,
                "quantity": quantity,
                "avg_price": avg_price or round(float(current_price), 2),
                "current_price": round(float(current_price), 2)
            })
            
        except Exception as e:
            return Response({"error": str(e)}, status=500)
