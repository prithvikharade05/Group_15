from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import ChatSession, ChatMessage
from .pipeline import run_pipeline
from prediction.utils import standardize_response


# ── Helpers ─────────────────────────────────────────────────────────────────

def _serialize_message(msg):
    return {
        "id": msg.id,
        "role": msg.role,
        "content": msg.content,
        "timestamp": msg.timestamp.isoformat(),
    }


def _get_history(session):
    """Return last 10 messages as list of dicts for pipeline context."""
    return [
        {"role": m.role, "content": m.content}
        for m in session.messages.order_by("timestamp")[:10]
    ]


# ── Views ────────────────────────────────────────────────────────────────────

class SessionView(APIView):
    """POST /api/chatbot/sessions/ — create a new chat session."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session = ChatSession.objects.create(user=request.user)
        return Response(
            standardize_response(data={"session_id": str(session.id), "created_at": session.created_at.isoformat()}),
            status=status.HTTP_201_CREATED
        )

    def get(self, request):
        """GET — list all sessions for the user."""
        sessions = ChatSession.objects.filter(user=request.user)
        data = [
            {"session_id": str(s.id), "created_at": s.created_at.isoformat(), "updated_at": s.updated_at.isoformat()}
            for s in sessions
        ]
        return Response(standardize_response(data=data))


class MessageView(APIView):
    """
    POST /api/chatbot/sessions/<session_id>/messages/ — send a message
    GET  /api/chatbot/sessions/<session_id>/          — get chat history
    """
    permission_classes = [IsAuthenticated]

    def _get_session(self, session_id, user):
        return get_object_or_404(ChatSession, id=session_id, user=user)

    def get(self, request, session_id):
        """Return full chat history for a session."""
        session = self._get_session(session_id, request.user)
        messages = session.messages.order_by("timestamp")
        return Response(standardize_response(data={
            "session_id": str(session.id),
            "messages": [_serialize_message(m) for m in messages]
        }))

    def post(self, request, session_id):
        """Send a user message, run the LangGraph pipeline, return AI response."""
        session = self._get_session(session_id, request.user)

        user_input = request.data.get("message", "").strip()
        if not user_input:
            return Response(
                standardize_response(success=False, error="Message cannot be empty."),
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save user message
        ChatMessage.objects.create(
            session=session,
            role="user",
            content=user_input
        )

        # Build conversation history for pipeline context
        history = _get_history(session)

        # Run LangGraph pipeline (never raises — has multiple fallbacks)
        ai_response = run_pipeline(user_input=user_input, history=history)

        # Save AI response
        ai_msg = ChatMessage.objects.create(
            session=session,
            role="assistant",
            content=ai_response
        )

        # Update session timestamp
        session.save()

        return Response(standardize_response(data={
            "response": ai_response,
            "message": _serialize_message(ai_msg)
        }), status=status.HTTP_200_OK)
