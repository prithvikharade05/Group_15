from django.urls import path
from .views import ARIMAPredictView, LSTMPredictView,RegressionPredictView,ClusterView

urlpatterns = [
    path('arima/', ARIMAPredictView.as_view()),
    path('lstm/', LSTMPredictView.as_view()),
    path('regression/', RegressionPredictView.as_view()),
    path('cluster/', ClusterView.as_view()),
]