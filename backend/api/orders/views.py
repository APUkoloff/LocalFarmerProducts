from decimal import Decimal

from django.db import transaction
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.products.models import Product
from api.users.models import ModerationStatus
from api.users.permissions import IsAdmin, IsBuyer, IsSeller
from api.payments.models import Payment, PaymentStatus

from .models import Order, OrderItem, OrderStatus, OrderStatusHistory
from .notifications import send_order_status_email, send_order_status_sms
from .serializers import CheckoutSerializer, OrderSerializer, OrderStatusUpdateSerializer


class CheckoutView(APIView):
    permission_classes = [IsAuthenticated, IsBuyer]

    @transaction.atomic
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        items_data = data['items']

        products_map = {}
        product_ids = [i['product_id'] for i in items_data]
        products = Product.objects.select_for_update().filter(
            id__in=product_ids,
            is_active=True,
            moderation_status=ModerationStatus.APPROVED,
        )
        for p in products:
            products_map[p.id] = p

        total = Decimal('0')
        order_items = []
        for item in items_data:
            product = products_map.get(item['product_id'])
            if not product:
                return Response(
                    {'detail': f'Product {item["product_id"]} not available.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            qty = Decimal(str(item['quantity']))
            if qty > product.stock_qty:
                return Response(
                    {
                        'detail': f'Insufficient stock for {product.name}. '
                        f'Available: {product.stock_qty} {product.unit}.',
                    },
                    status=status.HTTP_409_CONFLICT,
                )
            subtotal = qty * product.price
            total += subtotal
            order_items.append((product, qty, subtotal))

        order = Order.objects.create(
            buyer=request.user,
            payment_method=data['payment_method'],
            delivery_address=data['delivery_address'],
            phone=data['phone'],
            email=data.get('email') or request.user.email,
            total=total,
        )
        for product, qty, _ in order_items:
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=qty,
                price_snapshot=product.price,
                unit=product.unit,
            )
            product.stock_qty -= qty
            product.save(update_fields=['stock_qty'])

        OrderStatusHistory.objects.create(
            order=order, status=OrderStatus.PENDING, changed_by=request.user,
        )
        Payment.objects.create(
            order=order,
            method=data['payment_method'],
            amount=total,
            status=PaymentStatus.PENDING,
        )
        send_order_status_email(order)
        send_order_status_sms(order, order.phone)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsBuyer]
    serializer_class = OrderSerializer

    def get_queryset(self):
        qs = Order.objects.filter(buyer=self.request.user).prefetch_related('items__product')
        status_param = self.request.query_params.get('status')
        if status_param == 'active':
            qs = qs.exclude(status__in=[OrderStatus.DELIVERED, OrderStatus.CANCELLED])
        elif status_param == 'archived':
            qs = qs.filter(status__in=[OrderStatus.DELIVERED, OrderStatus.CANCELLED])
        return qs


class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.prefetch_related('items__product')
        if user.role == 'buyer':
            return qs.filter(buyer=user)
        if user.role == 'seller':
            return qs.filter(items__product__seller=user).distinct()
        if user.role == 'admin' or user.is_superuser:
            return qs
        return qs.none()


class OrderStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            order = Order.objects.prefetch_related('items__product').get(pk=pk)
        except Order.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if user.role == 'seller':
            seller_product_ids = set(user.products.values_list('id', flat=True))
            order_product_ids = {item.product_id for item in order.items.all()}
            if not order_product_ids.intersection(seller_product_ids):
                return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        elif user.role not in ('admin',) and not user.is_superuser:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data['status']
        order.status = new_status
        order.save(update_fields=['status', 'updated_at'])
        OrderStatusHistory.objects.create(order=order, status=new_status, changed_by=user)
        send_order_status_email(order)
        send_order_status_sms(order, order.phone)
        return Response(OrderSerializer(order).data)


class SellerOrderListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsSeller]
    serializer_class = OrderSerializer

    def get_queryset(self):
        seller_id = self.request.user.id
        qs = Order.objects.filter(
            items__product__seller_id=seller_id,
        ).distinct().prefetch_related('items__product')
        status_param = self.request.query_params.get('status')
        if status_param == 'active':
            qs = qs.exclude(status__in=[OrderStatus.DELIVERED, OrderStatus.CANCELLED])
        elif status_param == 'archived':
            qs = qs.filter(status__in=[OrderStatus.DELIVERED, OrderStatus.CANCELLED])
        return qs
