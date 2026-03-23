from django.urls import path
from .views import PortfolioAnalysisView, PortfolioListView, PortfolioAddView

urlpatterns = [
    path('', PortfolioListView.as_view()),
    path('analyze/', PortfolioAnalysisView.as_view()),
    path('add/', PortfolioAddView.as_view()),
]
