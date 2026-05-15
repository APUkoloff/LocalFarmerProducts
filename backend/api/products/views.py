from django.utils import translation
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.users.models import ModerationStatus, SellerProfile
from api.users.permissions import IsAdmin, IsSeller

from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ModerationSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductWriteSerializer,
)


def get_language(request):
    lang = request.headers.get('Accept-Language', 'ru')[:2]
    return lang if lang in ('ru', 'en') else 'ru'


class CategoryListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    pagination_class = None

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['language'] = get_language(self.request)
        return ctx


class ProductListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductListSerializer
    filterset_fields = ['category']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'name', 'rating_avg', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = Product.objects.filter(
            is_active=True,
            moderation_status=ModerationStatus.APPROVED,
        ).select_related('category', 'seller').prefetch_related('images')
        if self.request.query_params.get('in_stock') == 'true':
            qs = qs.filter(stock_qty__gt=0)
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['language'] = get_language(self.request)
        return ctx


class ProductDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        return Product.objects.filter(
            is_active=True,
            moderation_status=ModerationStatus.APPROVED,
        ).select_related('category', 'seller').prefetch_related('images')


class SellerProductListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsSeller]
    filterset_fields = ['category', 'is_active']
    search_fields = ['name']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductWriteSerializer
        return ProductListSerializer

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user).select_related('category').prefetch_related('images')


class SellerProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsSeller]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return ProductWriteSerializer
        return ProductDetailSerializer

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user).prefetch_related('images')


class AdminProductModerateView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ModerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product.moderation_status = serializer.validated_data['moderation_status']
        product.save(update_fields=['moderation_status'])
        return Response(ProductDetailSerializer(product, context={'request': request}).data)


class AdminModerationQueueView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        pending_products = Product.objects.filter(
            moderation_status=ModerationStatus.PENDING,
        ).select_related('seller', 'category')[:50]
        pending_sellers = SellerProfile.objects.filter(
            moderation_status=ModerationStatus.PENDING,
        ).select_related('user')[:50]
        return Response({
            'products': ProductListSerializer(
                pending_products, many=True, context={'request': request},
            ).data,
            'sellers': [
                {
                    'id': s.id,
                    'farm_name': s.farm_name,
                    'user': s.user.username,
                    'moderation_status': s.moderation_status,
                }
                for s in pending_sellers
            ],
        })


class AdminSellerModerateView(APIView):
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            profile = SellerProfile.objects.get(pk=pk)
        except SellerProfile.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ModerationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile.moderation_status = serializer.validated_data['moderation_status']
        profile.save(update_fields=['moderation_status'])
        return Response({
            'id': profile.id,
            'farm_name': profile.farm_name,
            'moderation_status': profile.moderation_status,
        })
