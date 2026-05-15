from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from api.users.models import ModerationStatus
from .models import Category, Product

User = get_user_model()


class ProductTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.seller = User.objects.create_user(username='seller', password='TestPass123!', role='seller')
        self.category = Category.objects.create(
            name='Vegetables', slug='vegetables', name_ru='Овощи', name_en='Vegetables',
        )
        Product.objects.create(
            seller=self.seller, category=self.category, name='Tomato',
            price=100, stock_qty=50, moderation_status=ModerationStatus.APPROVED,
        )

    def test_list_products(self):
        res = self.client.get('/api/products/')
        self.assertEqual(res.status_code, 200)

    def test_filter_in_stock(self):
        res = self.client.get('/api/products/?in_stock=true')
        self.assertEqual(res.status_code, 200)
