from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
import yfinance as yf
import logging
from .utils import standardize_response, safe_fetch

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
                fetched = safe_fetch(sym, period="5d", interval="1d")
                info = fetched.get("data")
                if info is not None and len(info) >= 2:
                    current = info['Close'].iloc[-1]
                    prev = info['Close'].iloc[-2]
                    change = ((current - prev) / prev) * 100 if prev else 0
                    data.append({
                        "symbol": sym.replace('.NS', ''),
                        "price": round(current, 2),
                        "change": round(change, 2),
                        "source": fetched.get("source"),
                    })
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
            fetched = safe_fetch(symbol, period="5d", interval="1d")
            info = fetched.get("data")

            if info is not None and len(info) >= 2:
                current = info['Close'].iloc[-1]
                prev = info['Close'].iloc[-2]
                change_pct = ((current - prev) / prev) * 100 if prev else 0
                change_val = current - prev
                
                return Response(standardize_response(data={
                    "symbol": symbol.replace('.NS', ''),
                    "price": round(current, 2),
                    "change_pct": round(change_pct, 2),
                    "change_val": round(change_val, 2),
                    "open": round(info['Open'].iloc[-1], 2),
                    "high": round(info['High'].iloc[-1], 2),
                    "low": round(info['Low'].iloc[-1], 2),
                    "volume": int(info['Volume'].iloc[-1]),
                    "source": fetched.get("source"),
                }))
            return Response(standardize_response(success=False, error="Insufficient data available."), status=200)
        except Exception as e:
            logger.error("MarketQuoteView error for %s: %s", symbol, e)
            return Response(standardize_response(success=False, error=str(e)))
