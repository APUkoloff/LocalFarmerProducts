from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import SellerProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'role', 'is_blocked', 'is_staff')
    list_filter = ('role', 'is_blocked', 'is_staff')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Fresh Market', {'fields': ('role', 'is_blocked', 'phone', 'default_address')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Fresh Market', {'fields': ('role', 'phone', 'default_address')}),
    )


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = ('farm_name', 'user', 'moderation_status')
    list_filter = ('moderation_status',)
