from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
import yfinance as yf
from .utils import standardize_response

class MarketTickerView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        symbols = ['^BSESN', '^NSEI', 'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS']
        data = []
        for sym in symbols:
            try:
                ticker = yf.Ticker(sym)
                info = ticker.history(period="5d")
                if len(info) >= 2:
                    current = info['Close'].iloc[-1]
                    prev = info['Close'].iloc[-2]
                    change = ((current - prev) / prev) * 100
                    data.append({
                        "symbol": sym.replace('.NS', ''),
                        "price": round(current, 2),
                        "change": round(change, 2)
                    })
            except:
                pass
        return Response(standardize_response(data={"tickers": data}))

class MarketQuoteView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def get(self, request):
        symbol = request.query_params.get("symbol", "RELIANCE").upper()
        if not symbol.endswith('.NS') and not symbol.startswith('^'):
            symbol += '.NS'
            
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.history(period="5d")
            
            if len(info) >= 2:
                current = info['Close'].iloc[-1]
                prev = info['Close'].iloc[-2]
                change_pct = ((current - prev) / prev) * 100
                change_val = current - prev
                
                return Response(standardize_response(data={
                    "symbol": symbol.replace('.NS', ''),
                    "price": round(current, 2),
                    "change_pct": round(change_pct, 2),
                    "change_val": round(change_val, 2),
                    "open": round(info['Open'].iloc[-1], 2),
                    "high": round(info['High'].iloc[-1], 2),
                    "low": round(info['Low'].iloc[-1], 2),
                    "volume": int(info['Volume'].iloc[-1])
                }))
            return Response(standardize_response(success=False, error="Insufficient data available."))
        except Exception as e:
            return Response(standardize_response(success=False, error=str(e)))
