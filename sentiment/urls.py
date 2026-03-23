from django.urls import path
from .views import SentimentAnalyzeView

urlpatterns = [
    path('analyze/', SentimentAnalyzeView.as_view()),
]
