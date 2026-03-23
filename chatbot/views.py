from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import time

class ChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get("message", "").lower()
        
        # Hardcoded responses to mock an AI advisor locally
        response_text = "I am processing the financial matrices. Please specify a distinct trading inquiry."
        
        if "hello" in message or "hi" in message:
            response_text = "Greetings, Node Operator. The Neural Market matrix is ready. How can I assist you with your allocations today?"
        elif "market" in message or "status" in message:
            response_text = "Global markets are currently experiencing elevated volatility. I recommend running the Clustering Engine to identify correlated risk vectors."
        elif "buy" in message or "invest" in message:
            response_text = "My algorithmic matrix suggests caution. Run the LSTM+CNN matrix on your target asset before executing large trades."
        elif "risk" in message:
            response_text = "Risk parameters are within acceptable thresholds for your current portfolio. Use the Portfolio Allocator to optimize your Sharpe ratio."
        elif "predict" in message or "forecast" in message:
            response_text = "I can analyze any ticker using our core predictive engines. Select a model from the Control Center to begin the quantum forecast."

        # Simulate processing delay
        time.sleep(1)
            
        return Response({
            "success": True,
            "response": response_text
        })
