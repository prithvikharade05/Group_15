from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
import logging
from .utils import standardize_response
from .fetch_engine import fetch_live_price

logger = logging.getLogger(__name__)

class MarketTickerView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        logger.info("MarketTickerView hit")
        symbols = ['^BSESN', '^NSEI', 'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS']
        data = []
        for sym in symbols:
            try:
                live = fetch_live_price(sym)
                payload = {"symbol": sym.replace(".NS", "")}
                if live.get("success") and live.get("data"):
                    info = live["data"]
                    payload.update({
                        "price": info.get("price"),
                        "change": info.get("change_pct"),
                        "source": info.get("source"),
                    })
                else:
                    payload.update({
                        "price": None,
                        "change": None,
                        "error": live.get("error"),
                        "source": live.get("source"),
                    })
                data.append(payload)
            except Exception as exc:
                logger.warning("MarketTickerView failed for %s: %s", sym, exc)
        return Response(standardize_response(data={"tickers": data}))

class MarketQuoteView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        symbol = request.query_params.get("symbol", "RELIANCE").upper()
        if not symbol.endswith('.NS') and not symbol.startswith('^'):
            symbol += '.NS'
            
        try:
            logger.info("MarketQuoteView hit symbol=%s", symbol)
            live = fetch_live_price(symbol)

            if live.get("success") and live.get("data"):
                info = live["data"]
                return Response(standardize_response(data={
                    "symbol": symbol.replace('.NS', ''),
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
