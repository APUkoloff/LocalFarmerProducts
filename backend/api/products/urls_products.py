from django.urls import path

from .views import ProductDetailView, ProductListView

urlpatterns = [
    path('', ProductListView.as_view(), name='products-list'),
    path('<slug:slug>/', ProductDetailView.as_view(), name='products-detail'),
]
