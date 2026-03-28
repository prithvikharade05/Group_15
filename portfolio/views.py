from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler
from .models import Stock, MarketSnapshot
from .services import fetch_sector_live_data
from prediction.utils import standardize_response, fetch_batch
from rest_framework import status
import logging

logger = logging.getLogger(__name__)
@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_portfolios(request):
    return Response(standardize_response(data=["NIFTY200", "USA200"]))


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def list_portfolio(request):
    """
    Simple portfolio list to satisfy /api/portfolio/ requests.
    """
    # In a real app, this would fetch from a UserPortfolio model.
    # For now, returning a standardized response with mock data.
    return Response(standardize_response(data=[{"name": "NIFTY200"}, {"name": "USA200"}]))


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
    return Response(standardize_response(data=list(sectors)))


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

    return Response(standardize_response(data=list(stocks)))


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def get_sector_data(request):
    sector = request.GET.get("sector")
    portfolio = request.GET.get("portfolio")

    if not sector:
        return Response(standardize_response(success=False, error="sector query parameter is required"), status=400)

    data = fetch_sector_live_data(sector, portfolio)
    return Response(standardize_response(data=data))


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def bulk_sector_stocks(request):
    """
    Optimized bulk fetch for all stocks in a sector using batched yfinance calls + cache.
    """
    sector = request.GET.get("sector")
    portfolio = request.GET.get("portfolio", "NIFTY200")

    if not sector:
        return Response(standardize_response(success=False, error="sector query parameter is required"), status=400)

    stocks = list(Stock.objects.filter(portfolio=portfolio, sector=sector).values("company", "symbol"))
    if not stocks:
        return Response(standardize_response(success=True, data=[]))

    # Build yfinance symbols
    symbol_map = {}
    yf_symbols = []
    for s in stocks:
        raw = s["symbol"]
        yf_sym = f"{raw}.NS" if portfolio == "NIFTY200" and not raw.endswith(".NS") else raw
        symbol_map[yf_sym] = raw
        yf_symbols.append(yf_sym)

    batch = fetch_batch(yf_symbols, period=\"5d\", interval=\"1d\")

    result_rows = []
    for yf_sym, raw in symbol_map.items():
        entry = batch.get(yf_sym, {\"success\": False, \"error\": \"missing\", \"data\": None})
        data = entry.get(\"data\") if entry else None
        ltp = change = change_pct = volume = None
        if entry.get(\"success\") and data is not None and not data.empty:
            ltp = float(data[\"Close\"].iloc[-1])
            prev = float(data[\"Close\"].iloc[-2]) if len(data) > 1 else ltp
            change_val = ltp - prev
            change = round(change_val, 2)
            change_pct = round((change_val / prev) * 100, 2) if prev else 0
            volume = int(data[\"Volume\"].iloc[-1]) if \"Volume\" in data.columns else None
        result_rows.append({
            \"company\": next((s[\"company\"] for s in stocks if s[\"symbol\"] == raw), raw),
            \"symbol\": raw,
            \"portfolio\": portfolio,
            \"sector\": sector,
            \"ltp\": ltp,
            \"change_percent\": change_pct,
            \"change\": change,
            \"volume\": volume,
            \"source\": entry.get(\"source\"),
            \"error\": entry.get(\"error\"),
        })

    logger.info(\"Bulk sector fetch sector=%s portfolio=%s cache_hits=%s\", sector, portfolio, sum(1 for v in batch.values() if v.get(\"source\") == \"cache\"))
    return Response(standardize_response(data=result_rows))


@api_view(['GET'])
@authentication_classes([])
@permission_classes([AllowAny])
def cluster_data(request):
    sector = request.GET.get("sector")
    portfolio = request.GET.get("portfolio")

    snapshot = MarketSnapshot.objects.filter(
        sector=sector,
        portfolio=portfolio
    ).order_by("-timestamp").first()

    if not snapshot:
        return Response(standardize_response(success=False, error="No snapshot data"), status=404)

    stocks = snapshot.stocks.all()

    data = []
    symbols = []

    for stock in stocks:
        if stock.change is None or stock.volume is None:
            continue

        data.append([stock.change, stock.volume])
        symbols.append(stock.symbol)

    if len(data) < 3:
        return Response(standardize_response(success=False, error="Not enough data"), status=400)

    # Normalize data
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(data)

    # KMeans clustering
    kmeans = KMeans(n_clusters=3, random_state=42)
    labels = kmeans.fit_predict(X_scaled)

    points = []
    for i in range(len(data)):
        points.append({
            "symbol": symbols[i],
            "change": round(data[i][0], 2),
            "volume": int(data[i][1]),
            "cluster": int(labels[i])
        })

    # Map clusters to human labels based on average change
    cluster_map = {}
    for i in range(3):
        cluster_points = [p for p in points if p["cluster"] == i]
        if len(cluster_points) == 0:
            cluster_map[i] = 0
            continue
        avg_change = sum(p["change"] for p in cluster_points) / len(cluster_points)
        cluster_map[i] = avg_change

    sorted_clusters = sorted(cluster_map.items(), key=lambda x: x[1])
    weak_cluster = sorted_clusters[0][0]
    neutral_cluster = sorted_clusters[1][0]
    strong_cluster = sorted_clusters[2][0]

    for p in points:
        if p["cluster"] == strong_cluster:
            p["label"] = "Strong"
        elif p["cluster"] == weak_cluster:
            p["label"] = "Weak"
        else:
            p["label"] = "Neutral"

    strong = [p for p in points if p["label"] == "Strong"]
    weak = [p for p in points if p["label"] == "Weak"]
    neutral = [p for p in points if p["label"] == "Neutral"]

    trend = "Bullish" if len(strong) > len(weak) else "Bearish"

    top_gainer = max(points, key=lambda x: x["change"])
    top_loser = min(points, key=lambda x: x["change"])

    report = {
        "trend": trend,
        "strong_count": len(strong),
        "weak_count": len(weak),
        "neutral_count": len(neutral),
        "top_gainer": top_gainer["symbol"],
        "top_loser": top_loser["symbol"],
        "message": f"{trend} momentum detected. Leaders: {top_gainer['symbol']}, Weakest: {top_loser['symbol']}"
    }

    return Response(standardize_response(data={
        "points": points,
        "report": report
    }))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_stock(request):
    symbol = request.data.get("symbol")
    if not symbol:
        return Response(standardize_response(success=False, error="Symbol required"), status=400)
    # Mock behavior for now as requested
    return Response(standardize_response(success=True, data={"message": f"{symbol} added to portfolio"}))


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_stock(request, symbol):
    if not symbol:
        return Response(standardize_response(success=False, error="Symbol required"), status=400)
    # Mock behavior for now as requested
    return Response(standardize_response(success=True, data={"message": f"{symbol} removed from portfolio"}))
