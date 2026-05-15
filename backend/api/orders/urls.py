from django.urls import path

from .views import CheckoutView, OrderDetailView, OrderListView, OrderStatusUpdateView

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='orders-checkout'),
    path('', OrderListView.as_view(), name='orders-list'),
    path('<int:pk>/', OrderDetailView.as_view(), name='orders-detail'),
    path('<int:pk>/status/', OrderStatusUpdateView.as_view(), name='orders-status'),
]
