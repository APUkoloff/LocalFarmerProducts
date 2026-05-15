from decimal import Decimal

from rest_framework import serializers

from api.products.models import Product

from .models import Order, OrderItem, OrderStatus, PaymentMethod


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, max_value=None)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_name', 'quantity', 'price_snapshot', 'unit', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'status', 'status_display', 'payment_method', 'payment_method_display',
            'delivery_address', 'phone', 'email', 'total', 'items', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'status', 'total', 'created_at', 'updated_at')


class CheckoutItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('0.01'))


class CheckoutSerializer(serializers.Serializer):
    items = CheckoutItemSerializer(many=True, min_length=1)
    payment_method = serializers.ChoiceField(choices=PaymentMethod.choices)
    delivery_address = serializers.CharField(min_length=10)
    phone = serializers.CharField(min_length=7, max_length=20)
    email = serializers.EmailField(required=False, allow_blank=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError('Cart is empty.')
        return items


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=OrderStatus.choices)
