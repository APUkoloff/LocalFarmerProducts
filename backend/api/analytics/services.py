from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate, TruncMonth, TruncWeek
from django.utils import timezone

from api.orders.models import Order, OrderItem, OrderStatus

User = get_user_model()


def parse_period(period):
    now = timezone.now()
    mapping = {
        'day': timedelta(days=1),
        'week': timedelta(days=7),
        'month': timedelta(days=30),
        'year': timedelta(days=365),
    }
    delta = mapping.get(period, timedelta(days=7))
    return now - delta, now


def get_granularity_fn(granularity):
    return {
        'day': TruncDate,
        'week': TruncWeek,
        'month': TruncMonth,
    }.get(granularity, TruncDate)


def admin_analytics(from_date=None, to_date=None, granularity='day'):
    qs = Order.objects.exclude(status=OrderStatus.CANCELLED)
    if from_date:
        qs = qs.filter(created_at__gte=from_date)
    if to_date:
        qs = qs.filter(created_at__lte=to_date)

    trunc = get_granularity_fn(granularity)
    revenue_by_period = list(
        qs.annotate(period=trunc('created_at'))
        .values('period')
        .annotate(revenue=Sum('total'), orders_count=Count('id'))
        .order_by('period')
    )
    for row in revenue_by_period:
        row['period'] = row['period'].isoformat() if row['period'] else None
        row['revenue'] = float(row['revenue'] or 0)

    return {
        'total_users': User.objects.count(),
        'total_orders': qs.count(),
        'total_revenue': float(qs.aggregate(s=Sum('total'))['s'] or 0),
        'revenue_by_period': revenue_by_period,
    }


def seller_analytics(seller, from_date=None, to_date=None, granularity='day'):
    items_qs = OrderItem.objects.filter(
        product__seller=seller,
        order__status__in=[OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPING, OrderStatus.DELIVERED],
    )
    if from_date:
        items_qs = items_qs.filter(order__created_at__gte=from_date)
    if to_date:
        items_qs = items_qs.filter(order__created_at__lte=to_date)

    total_revenue = sum(
        (item.quantity * item.price_snapshot for item in items_qs.select_related('order')),
        Decimal('0'),
    )
    order_ids = items_qs.values_list('order_id', flat=True).distinct()
    orders_count = len(set(order_ids))

    trunc = get_granularity_fn(granularity)
    revenue_by_period = list(
        items_qs.annotate(period=trunc('order__created_at'))
        .values('period')
        .annotate(
            revenue=Sum('price_snapshot'),
            items_count=Count('id'),
        )
        .order_by('period')
    )
    for row in revenue_by_period:
        row['period'] = row['period'].isoformat() if row['period'] else None
        row['revenue'] = float(row['revenue'] or 0)

    return {
        'total_revenue': float(total_revenue),
        'orders_count': orders_count,
        'revenue_by_period': revenue_by_period,
    }


def export_orders_data(from_date=None, to_date=None):
    qs = Order.objects.select_related('buyer').prefetch_related('items__product')
    if from_date:
        qs = qs.filter(created_at__gte=from_date)
    if to_date:
        qs = qs.filter(created_at__lte=to_date)
    rows = []
    for order in qs:
        for item in order.items.all():
            rows.append({
                'order_id': order.id,
                'buyer': order.buyer.username,
                'status': order.status,
                'product': item.product.name,
                'quantity': float(item.quantity),
                'price': float(item.price_snapshot),
                'total': float(order.total),
                'created_at': order.created_at.isoformat(),
            })
    return rows
