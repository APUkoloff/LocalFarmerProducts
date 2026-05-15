import logging

from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


def send_order_status_email(order):
    subject = f'Order #{order.pk} status: {order.get_status_display()}'
    message = (
        f'Your order #{order.pk} status has been updated to: {order.get_status_display()}.\n'
        f'Total: {order.total} RUB\n'
        f'Delivery address: {order.delivery_address}'
    )
    if order.email:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [order.email],
            fail_silently=True,
        )
    logger.info('Email notification sent for order %s', order.pk)


def send_order_status_sms(order, phone):
    """SMS stub — logs in dev; hook real provider in production."""
    message = f'Order #{order.pk}: {order.get_status_display()}'
    logger.info('SMS to %s: %s', phone, message)
