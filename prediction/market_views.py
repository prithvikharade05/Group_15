from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
import logging
from django.db.models import OuterRef, Subquery, F
from .utils import standardize_response
from .fetch_engine import fetch_live_price
from .multi_source_provider import strip_exchange
from .models import MarketTickerSnapshot
from .ticker_constants import TOP_NIFTY_SYMBOLS, COMPANY_LOOKUP

logger = logging.getLogger(__name__)

class MarketTickerView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        logger.info("MarketTickerView hit (DB-backed)")

        latest_ts = Subquery(
            MarketTickerSnapshot.objects.filter(symbol=OuterRef("symbol"))
            .order_by("-timestamp")
            .values("timestamp")[:1]
        )

        latest_rows = (
            MarketTickerSnapshot.objects.filter(symbol__in=TOP_NIFTY_SYMBOLS)
            .annotate(latest_ts=latest_ts)
            .filter(timestamp=F("latest_ts"))
        )

        snapshot_map = {row.symbol: row for row in latest_rows}

        data = []
        for sym in TOP_NIFTY_SYMBOLS:
            snap = snapshot_map.get(sym)
            payload = {
                "symbol": sym,
                "company": COMPANY_LOOKUP.get(sym),
                "price": None,
                "change": None,
                "change_val": None,
                "volume": None,
                "source": None,
                "timestamp": None,
            }
            if snap:
                payload.update(
                    {
                        "price": float(snap.price) if snap.price is not None else None,
                        "change": float(snap.change_percent)
                        if snap.change_percent is not None
                        else None,
                        "change_val": float(snap.change) if snap.change is not None else None,
                        "volume": snap.volume,
                        "source": snap.source,
                        "timestamp": snap.timestamp,
                    }
                )
            data.append(payload)

        return Response(standardize_response(data={"tickers": data}))

class MarketQuoteView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        symbol = request.query_params.get("symbol", "RELIANCE").upper()
        portfolio = request.query_params.get("portfolio", "NIFTY200")
        try:
            logger.info("MarketQuoteView hit symbol=%s", symbol)
            live = fetch_live_price(symbol, portfolio=portfolio)

            if live.get("success") and live.get("data"):
                info = live["data"]
                resolved_symbol = strip_exchange(info.get("symbol") or symbol)
                return Response(standardize_response(data={
                    "symbol": resolved_symbol,
                    "price": round(info.get("price", 0), 2),
                    "change_pct": round(info.get("change_pct", 0), 2) if info.get("change_pct") is not None else None,
                    "change_val": round(info.get("change", 0), 2) if info.get("change") is not None else None,
                    "open": info.get("prev_close"),
                    "high": None,
                    "low": None,
                    "volume": info.get("volume"),
                    "source": info.get("source"),
                }))
            return Response(standardize_response(success=False, error=live.get("error") or "Insufficient data available."), status=200)
        except Exception as e:
            logger.error("MarketQuoteView error for %s: %s", symbol, e)
            return Response(standardize_response(success=False, error=str(e)))
