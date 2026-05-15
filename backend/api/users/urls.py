from django.urls import path

from .views import MeView, SellerProfileView

urlpatterns = [
    path('me/', MeView.as_view(), name='users-me'),
    path('seller-profile/', SellerProfileView.as_view(), name='seller-profile'),
]
