from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import SellerProfile, User, UserRole


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'default_address', 'is_blocked',
        )
        read_only_fields = ('id', 'role', 'is_blocked')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=[UserRole.BUYER, UserRole.SELLER], default=UserRole.BUYER)
    farm_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone', 'role', 'farm_name',
        )

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        if attrs.get('role') == UserRole.SELLER and not attrs.get('farm_name'):
            raise serializers.ValidationError({'farm_name': 'Required for seller registration.'})
        return attrs

    def create(self, validated_data):
        farm_name = validated_data.pop('farm_name', '')
        role = validated_data.pop('role', UserRole.BUYER)
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data, role=role)
        user.set_password(password)
        user.save()
        if role == UserRole.SELLER:
            SellerProfile.objects.create(user=user, farm_name=farm_name)
        return user


class SellerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = SellerProfile
        fields = ('id', 'farm_name', 'contact_address', 'payout_details', 'moderation_status', 'created_at')
        read_only_fields = ('id', 'moderation_status', 'created_at')


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'default_address', 'is_blocked', 'date_joined',
        )
