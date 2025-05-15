from django.contrib import admin
from .models import Products, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']
    ordering = ['name']

@admin.register(Products)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['productName', 'category', 'price', 'stockCount', 'rating']
    list_filter = ['category', 'createdAt']
    search_fields = ['productName', 'description']
    ordering = ['productName']
