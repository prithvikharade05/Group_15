from django.urls import path
from .views import RegisterView, LoginView, SetMPINView, VerifyMPINView

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('set-mpin/', SetMPINView.as_view()),
    path('verify-mpin/', VerifyMPINView.as_view()),
]