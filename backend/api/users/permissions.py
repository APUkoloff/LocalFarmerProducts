from rest_framework.permissions import BasePermission

from .models import UserRole


class IsBuyer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == UserRole.BUYER


class IsSeller(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == UserRole.SELLER
            and not request.user.is_blocked
        )


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role == UserRole.ADMIN or request.user.is_superuser
        )


class IsNotBlocked(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and not request.user.is_blocked
