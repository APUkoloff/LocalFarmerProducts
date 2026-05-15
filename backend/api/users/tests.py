from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

User = get_user_model()


class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_buyer(self):
        res = self.client.post(
            '/api/auth/register/',
            {
                'username': 'newbuyer',
                'email': 'nb@test.com',
                'password': 'TestPass123!',
                'password_confirm': 'TestPass123!',
                'role': 'buyer',
            },
            format='json',
        )
        self.assertEqual(res.status_code, 201)
        self.assertTrue(User.objects.filter(username='newbuyer').exists())

    def test_login(self):
        User.objects.create_user(username='logintest', password='TestPass123!', role='buyer')
        res = self.client.post('/api/auth/login/', {
            'username': 'logintest',
            'password': 'TestPass123!',
        })
        self.assertEqual(res.status_code, 200)
        self.assertIn('access', res.data)

    def test_health(self):
        res = self.client.get('/api/health/')
        self.assertEqual(res.status_code, 200)
