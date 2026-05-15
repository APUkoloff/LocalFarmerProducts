from django.contrib.auth.models import AbstractUser
from django.db import models


class UserRole(models.TextChoices):
    BUYER = 'buyer', 'Buyer'
    SELLER = 'seller', 'Seller'
    ADMIN = 'admin', 'Admin'


class ModerationStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'


class User(AbstractUser):
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.BUYER)
    is_blocked = models.BooleanField(default=False)
    phone = models.CharField(max_length=20, blank=True)
    default_address = models.TextField(blank=True)

    class Meta:
        db_table = 'users'

    @property
    def is_buyer(self):
        return self.role == UserRole.BUYER

    @property
    def is_seller(self):
        return self.role == UserRole.SELLER

    @property
    def is_admin_user(self):
        return self.role == UserRole.ADMIN or self.is_superuser


class SellerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='seller_profile')
    farm_name = models.CharField(max_length=200)
    contact_address = models.TextField(blank=True)
    payout_details = models.JSONField(default=dict, blank=True)
    moderation_status = models.CharField(
        max_length=20,
        choices=ModerationStatus.choices,
        default=ModerationStatus.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'seller_profiles'

    def __str__(self):
        return self.farm_name
