from django.urls import path
from .views import SectorSentimentView

urlpatterns = [
    path("sector/<str:sector>/", SectorSentimentView.as_view(), name="sector-sentiment"),
]
