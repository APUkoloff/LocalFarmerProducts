from rest_framework import serializers

from api.users.models import ModerationStatus

from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    localized_name = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'name_ru', 'name_en', 'localized_name')

    def get_localized_name(self, obj):
        lang = self.context.get('language', 'ru')
        return obj.name_en if lang == 'en' else obj.name_ru


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'order')


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    primary_image = serializers.SerializerMethodField()
    in_stock = serializers.SerializerMethodField()
    unit_display = serializers.CharField(source='get_unit_display', read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'price', 'unit', 'unit_display', 'stock_qty',
            'rating_avg', 'category', 'category_name', 'seller', 'seller_name',
            'primary_image', 'in_stock', 'created_at',
        )

    def get_primary_image(self, obj):
        img = obj.images.first()
        if img and img.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(img.image.url)
            return img.image.url
        return None

    def get_in_stock(self, obj):
        return obj.stock_qty > 0


class ProductDetailSerializer(ProductListSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    description = serializers.CharField()

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ('description', 'images', 'moderation_status')


class ProductWriteSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        write_only=True,
    )

    class Meta:
        model = Product
        fields = (
            'id', 'category', 'name', 'description', 'price',
            'unit', 'stock_qty', 'is_active', 'images',
        )
        read_only_fields = ('id',)

    def create(self, validated_data):
        images = validated_data.pop('images', [])
        validated_data['seller'] = self.context['request'].user
        validated_data['moderation_status'] = ModerationStatus.PENDING
        product = Product.objects.create(**validated_data)
        self._save_images(product, images)
        return product

    def update(self, instance, validated_data):
        images = validated_data.pop('images', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if images is not None:
            instance.images.all().delete()
            self._save_images(instance, images)
        return instance

    def _save_images(self, product, images):
        from .utils import compress_image

        for i, img in enumerate(images):
            pi = ProductImage(product=product, image=img, order=i)
            compress_image(pi.image)
            pi.save()


class ModerationSerializer(serializers.Serializer):
    moderation_status = serializers.ChoiceField(choices=ModerationStatus.choices)
