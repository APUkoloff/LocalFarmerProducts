from django.contrib import admin

from .models import Category, Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'name_ru', 'name_en')
    prepopulated_fields = {'slug': ('name_en',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'seller', 'category', 'price', 'stock_qty', 'moderation_status', 'is_active')
    list_filter = ('moderation_status', 'is_active', 'category')
    inlines = [ProductImageInline]
