from django.urls import path

from .views import SellerAnalyticsView

urlpatterns = [
    path('', SellerAnalyticsView.as_view(), name='seller-analytics'),
]
