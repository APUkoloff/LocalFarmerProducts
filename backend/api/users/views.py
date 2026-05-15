from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import SellerProfile, UserRole
from .permissions import IsAdmin, IsNotBlocked, IsSeller
from .serializers import (
    AdminUserSerializer,
    RegisterSerializer,
    SellerProfileSerializer,
    UserSerializer,
)

User = get_user_model()


class AuthThrottle(AnonRateThrottle):
    scope = 'auth'


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({'status': 'ok', 'service': 'fresh-market-api'})


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    throttle_classes = [AuthThrottle]


class LoginView(TokenObtainPairView):
    throttle_classes = [AuthThrottle]


class RefreshView(TokenRefreshView):
    pass


class MeView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsNotBlocked]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class SellerProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsSeller]
    serializer_class = SellerProfileSerializer

    def get_object(self):
        profile, _ = SellerProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'farm_name': self.request.user.username},
        )
        return profile


class AdminUserListView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminUserSerializer
    queryset = User.objects.all().order_by('-date_joined')
    filterset_fields = ['role', 'is_blocked']
    search_fields = ['username', 'email', 'first_name', 'last_name']


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminUserSerializer
    queryset = User.objects.all()


class AdminBlockUserView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        is_blocked = request.data.get('is_blocked', not user.is_blocked)
        user.is_blocked = bool(is_blocked)
        user.save(update_fields=['is_blocked'])
        return Response(AdminUserSerializer(user).data)
