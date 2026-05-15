from decimal import Decimal

from django.core.management.base import BaseCommand

from api.products.models import Category, Product, ProductUnit
from api.users.models import ModerationStatus, SellerProfile, User, UserRole


class Command(BaseCommand):
    help = 'Seed demo data for Fresh Market'

    def handle(self, *args, **options):
        self.stdout.write('Seeding demo data...')

        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@freshmarket.local',
                'role': UserRole.ADMIN,
                'first_name': 'Admin',
                'is_staff': True,
                'is_superuser': True,
            },
        )
        if not admin.has_usable_password():
            admin.set_password('password123')
            admin.save()

        buyer, _ = User.objects.get_or_create(
            username='buyer',
            defaults={
                'email': 'buyer@freshmarket.local',
                'role': UserRole.BUYER,
                'first_name': 'Ivan',
                'last_name': 'Buyer',
                'phone': '+79001234567',
                'default_address': 'Moscow, Lenina 1',
            },
        )
        if not buyer.has_usable_password():
            buyer.set_password('password123')
            buyer.save()

        categories_data = [
            ('vegetables', 'Овощи', 'Vegetables'),
            ('dairy', 'Молочные', 'Dairy'),
            ('fruits', 'Фрукты', 'Fruits'),
            ('meat', 'Мясо', 'Meat'),
            ('honey', 'Мёд', 'Honey'),
        ]
        categories = {}
        for slug, name_ru, name_en in categories_data:
            cat, _ = Category.objects.get_or_create(
                slug=slug,
                defaults={'name': name_ru, 'name_ru': name_ru, 'name_en': name_en},
            )
            categories[slug] = cat

        sellers_data = [
            ('seller1', 'Green Valley Farm', 'seller1@freshmarket.local'),
            ('seller2', 'Sunny Meadow', 'seller2@freshmarket.local'),
        ]
        sellers = []
        for username, farm_name, email in sellers_data:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={'email': email, 'role': UserRole.SELLER, 'first_name': farm_name},
            )
            if created or not user.has_usable_password():
                user.set_password('password123')
                user.save()
            profile, _ = SellerProfile.objects.get_or_create(
                user=user,
                defaults={'farm_name': farm_name, 'moderation_status': ModerationStatus.APPROVED},
            )
            if profile.moderation_status != ModerationStatus.APPROVED:
                profile.moderation_status = ModerationStatus.APPROVED
                profile.save()
            sellers.append(user)

        products_data = [
            ('Помидоры черри', 'vegetables', 250, ProductUnit.KG, 50),
            ('Огурцы свежие', 'vegetables', 180, ProductUnit.KG, 40),
            ('Морковь', 'vegetables', 90, ProductUnit.KG, 100),
            ('Картофель молодой', 'vegetables', 70, ProductUnit.KG, 200),
            ('Капуста белокочанная', 'vegetables', 60, ProductUnit.KG, 80),
            ('Молоко фермерское', 'dairy', 120, ProductUnit.PIECE, 30),
            ('Творог домашний', 'dairy', 350, ProductUnit.KG, 20),
            ('Сметана 20%', 'dairy', 200, ProductUnit.PIECE, 25),
            ('Сыр адыгейский', 'dairy', 650, ProductUnit.KG, 15),
            ('Яблоки антоновка', 'fruits', 150, ProductUnit.KG, 60),
            ('Груши', 'fruits', 200, ProductUnit.KG, 35),
            ('Клубника', 'fruits', 450, ProductUnit.KG, 10),
            ('Малина', 'fruits', 550, ProductUnit.KG, 8),
            ('Говядина вырезка', 'meat', 890, ProductUnit.KG, 12),
            ('Курица деревенская', 'meat', 320, ProductUnit.KG, 25),
            ('Свинина домашняя', 'meat', 650, ProductUnit.KG, 18),
            ('Мёд липовый', 'honey', 800, ProductUnit.PIECE, 20),
            ('Мёд гречишный', 'honey', 750, ProductUnit.PIECE, 15),
            ('Мёд цветочный', 'honey', 700, ProductUnit.PIECE, 22),
            ('Яйца куриные С0', 'dairy', 150, ProductUnit.PIECE, 50),
        ]

        for i, (name, cat_slug, price, unit, stock) in enumerate(products_data):
            seller = sellers[i % len(sellers)]
            cat = categories[cat_slug]
            Product.objects.get_or_create(
                name=name,
                seller=seller,
                defaults={
                    'category': cat,
                    'description': f'Свежий фермерский продукт: {name}. Выращено без химии.',
                    'price': Decimal(str(price)),
                    'unit': unit,
                    'stock_qty': Decimal(str(stock)),
                    'rating_avg': Decimal('4.5'),
                    'moderation_status': ModerationStatus.APPROVED,
                    'is_active': True,
                },
            )

        self.stdout.write(self.style.SUCCESS(
            'Demo data seeded!\n'
            'Logins (password: password123):\n'
            '  admin / admin@freshmarket.local\n'
            '  buyer / buyer@freshmarket.local\n'
            '  seller1, seller2'
        ))
