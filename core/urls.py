from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('prediction.urls')),
    path('api/portfolio/', include('portfolio.urls')),
    path('api/sentiment/', include('sentiment.urls')),
    path('api/chatbot/', include('chatbot.urls')),
    path('api/chat/', include('chatbot.urls')),
]
