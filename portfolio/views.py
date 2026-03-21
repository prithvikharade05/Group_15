from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .services import portfolio_analysis_engine


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