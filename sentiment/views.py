from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import yfinance as yf

class SentimentAnalyzeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        symbol = request.data.get("symbol", "RELIANCE")
        if not symbol.endswith(".NS"):
            symbol += ".NS"
        
        try:
            ticker = yf.Ticker(symbol)
            news = ticker.news
            
            # Simple mock sentiment determination based on words
            positive_words = ['up', 'high', 'gain', 'profit', 'surges', 'growth', 'bull', 'buy']
            negative_words = ['down', 'low', 'loss', 'drop', 'plunges', 'bear', 'sell', 'risk']
            
            analyzed_news = []
            overall_score = 0
            
            for item in news[:5]:
                title = item.get('title', '').lower()
                sentiment = "Neutral"
                score = 0
                
                if any(w in title for w in positive_words):
                    sentiment = "Positive"
                    score = 1
                elif any(w in title for w in negative_words):
                    sentiment = "Negative"
                    score = -1
                    
                overall_score += score
                analyzed_news.append({
                    "title": item.get('title'),
                    "publisher": item.get('publisher'),
                    "link": item.get('link'),
                    "sentiment": sentiment
                })
                
            final_sentiment = "BULLISH" if overall_score > 0 else "BEARISH" if overall_score < 0 else "NEUTRAL"
            confidence = min(100, 50 + abs(overall_score) * 10)
            
            return Response({
                "success": True, 
                "symbol": symbol.replace(".NS", ""), 
                "overall_sentiment": final_sentiment,
                "confidence_score": confidence,
                "news": analyzed_news
            })
        except Exception as e:
            return Response({"success": False, "error": str(e)}, status=500)
