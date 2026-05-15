from django.urls import path

from .views import SellerProductDetailView, SellerProductListCreateView

urlpatterns = [
    path('products/', SellerProductListCreateView.as_view(), name='seller-products'),
    path('products/<int:pk>/', SellerProductDetailView.as_view(), name='seller-product-detail'),
]
