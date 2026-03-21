from django.urls import path
from .views import PortfolioAnalysisView

urlpatterns = [
    path('analyze/', PortfolioAnalysisView.as_view()),
]