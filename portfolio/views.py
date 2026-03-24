from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import Stock
from .services import fetch_sector_live_data


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_portfolios(request):
    return Response(["NIFTY200", "USA200"])


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def list_portfolio(request):
    """
    Simple portfolio list to satisfy /api/portfolio/ requests.
    """
    return Response([{"name": "NIFTY200"}, {"name": "USA200"}])


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_sectors(request):
    portfolio = request.GET.get("portfolio")
    sectors = (
        Stock.objects.filter(portfolio=portfolio)
        .values_list("sector", flat=True)
        .distinct()
        .order_by("sector")
    )
    return Response(list(sectors))


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_stocks(request):
    portfolio = request.GET.get("portfolio")
    sector = request.GET.get("sector")

    stocks = Stock.objects.filter(portfolio=portfolio, sector=sector).values(
        "company",
        "symbol",
        "portfolio",
        "sector",
        "ltp",
        "change_percent",
        "market_cap",
        "high_52w",
        "low_52w",
        "volume",
    )

    return Response(list(stocks))


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_sector_data(request):
    sector = request.GET.get("sector")
    portfolio = request.GET.get("portfolio")

    if not sector:
        return Response({"error": "sector query parameter is required"}, status=400)

    data = fetch_sector_live_data(sector, portfolio)
    return Response(data)
