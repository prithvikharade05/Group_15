from django.urls import path
from .views import SessionView, MessageView

urlpatterns = [
    # Create session / list sessions
    path("sessions/", SessionView.as_view(), name="chatbot-sessions"),

    # Get history / send message for a specific session
    path("sessions/<uuid:session_id>/", MessageView.as_view(), name="chatbot-history"),
    path("sessions/<uuid:session_id>/messages/", MessageView.as_view(), name="chatbot-messages"),
]
