from django.urls import path
from .views import bulk_sector_stocks

urlpatterns = [
    path('stocks/', bulk_sector_stocks),
]
