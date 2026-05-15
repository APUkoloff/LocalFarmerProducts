from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from api.products.models import Category, Product
from api.users.models import ModerationStatus
from .models import Order

User = get_user_model()


class OrderTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.buyer = User.objects.create_user(username='buyer', password='TestPass123!', role='buyer')
        self.seller = User.objects.create_user(username='seller2', password='TestPass123!', role='seller')
        self.category = Category.objects.create(
            name='Fruits', slug='fruits', name_ru='Фрукты', name_en='Fruits',
        )
        self.product = Product.objects.create(
            seller=self.seller, category=self.category, name='Apple',
            price=Decimal('150'), stock_qty=Decimal('10'),
            moderation_status=ModerationStatus.APPROVED,
        )
        self.client.force_authenticate(user=self.buyer)

    def test_checkout(self):
        res = self.client.post(
            '/api/orders/checkout/',
            {
                'items': [{'product_id': self.product.id, 'quantity': '2'}],
                'payment_method': 'cash_on_delivery',
                'delivery_address': 'Moscow, Test street 10',
                'phone': '+79001234567',
            },
            format='json',
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(Order.objects.count(), 1)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_qty, Decimal('8'))
