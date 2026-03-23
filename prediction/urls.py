from django.urls import path
from .views import ARIMAPredictView, LSTMPredictView,RegressionPredictView,ClusterView, StocksView, ModelsView, StockDetailView, PredictionsView, ModelsRunView, RunPredictionView
from .market_views import MarketTickerView, MarketQuoteView

urlpatterns = [
    path('arima/', ARIMAPredictView.as_view()),
    path('lstm/', LSTMPredictView.as_view()),
    path('regression/', RegressionPredictView.as_view()),
    path('cluster/', ClusterView.as_view()),
    path('market/', MarketTickerView.as_view()),
    path('quote/', MarketQuoteView.as_view()),
    path('stocks/', StocksView.as_view()),
    path('stocks/<str:symbol>/', StockDetailView.as_view()),
    path('predictions/<str:symbol>/', PredictionsView.as_view()),
    path('predictions/', RunPredictionView.as_view()),
    path('models/', ModelsView.as_view()),
    path('models/run/', ModelsRunView.as_view()),
]
