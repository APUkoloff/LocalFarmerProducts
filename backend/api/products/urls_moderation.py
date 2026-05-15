from django.urls import path

from .views import AdminModerationQueueView, AdminProductModerateView, AdminSellerModerateView

urlpatterns = [
    path('', AdminModerationQueueView.as_view(), name='admin-moderation-queue'),
    path('products/<int:pk>/', AdminProductModerateView.as_view(), name='admin-moderate-product'),
    path('sellers/<int:pk>/', AdminSellerModerateView.as_view(), name='admin-moderate-seller'),
]
