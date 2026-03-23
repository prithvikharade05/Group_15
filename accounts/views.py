from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password

from .serializers import RegisterSerializer, LoginSerializer


# REGISTER
class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "User created"}, status=201)


# LOGIN (JWT)
class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "has_mpin": bool(user.mpin)
        })


# SET MPIN
class SetMPINView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        mpin = request.data.get("mpin")

        if not mpin:
            return Response({"error": "MPIN required"}, status=400)

        user = request.user
        user.mpin = make_password(mpin)
        user.save()

        return Response({"message": "MPIN set"})


# VERIFY MPIN
class VerifyMPINView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        mpin = request.data.get("mpin")

        if not mpin:
            return Response({"error": "MPIN required"}, status=400)

        user = request.user

        if check_password(mpin, user.mpin):
            return Response({"message": "MPIN verified"})
        
        return Response({"error": "Invalid MPIN"}, status=400)

# PROFILE
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": getattr(user, 'email', ''),
            "has_mpin": bool(user.mpin)
        })
