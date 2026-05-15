from django.urls import path

from .views import AdminBlockUserView, AdminUserDetailView, AdminUserListView

urlpatterns = [
    path('users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-users-detail'),
    path('users/<int:pk>/block/', AdminBlockUserView.as_view(), name='admin-users-block'),
]
