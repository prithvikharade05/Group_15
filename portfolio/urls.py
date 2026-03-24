from django.urls import path
from .views import (
    get_portfolios,
    get_sectors,
    get_stocks,
    get_sector_data,
    list_portfolio,
)

urlpatterns = [
    path('', list_portfolio),
    path('portfolios/', get_portfolios),
    path('sectors/', get_sectors),
    path('stocks/', get_stocks),
    path('sector-data/', get_sector_data),
]
