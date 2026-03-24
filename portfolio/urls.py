from django.urls import path
from .views import get_portfolios, get_sectors, get_stocks

urlpatterns = [
    path('portfolios/', get_portfolios),
    path('sectors/', get_sectors),
    path('stocks/', get_stocks),
]