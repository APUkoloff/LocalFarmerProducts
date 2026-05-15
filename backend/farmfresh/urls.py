from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from api.users.views import health_check

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/auth/', include('api.users.urls_auth')),
    path('api/users/', include('api.users.urls')),
    path('api/admin/', include('api.users.urls_admin')),
    path('api/categories/', include('api.products.urls_categories')),
    path('api/products/', include('api.products.urls_products')),
    path('api/seller/', include('api.products.urls_seller')),
    path('api/orders/', include('api.orders.urls')),
    path('api/seller/orders/', include('api.orders.urls_seller')),
    path('api/seller/analytics/', include('api.analytics.urls_seller')),
    path('api/admin/analytics/', include('api.analytics.urls_admin')),
    path('api/admin/moderation/', include('api.products.urls_moderation')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
