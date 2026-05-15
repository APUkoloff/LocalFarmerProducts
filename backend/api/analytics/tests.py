from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

User = get_user_model()


class AnalyticsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='admin2', password='TestPass123!', role='admin', is_staff=True,
        )

    def test_export_csv(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/admin/analytics/export.csv')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res['Content-Type'], 'text/csv')
