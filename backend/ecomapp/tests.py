from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Products, Category, Wishlist
from django.urls import reverse

class WishlistTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            email='test@example.com'
        )
        self.category = Category.objects.create(name='Electronics')
        self.product = Products.objects.create(
            user=self.user,
            productName='Test Product',
            category=self.category,
            price=99.99,
            stockCount=0  # Out of stock product
        )
        self.client.force_authenticate(user=self.user)

    def test_add_to_wishlist(self):
        """Test adding an out-of-stock item to wishlist"""
        url = reverse('wishlist-item', kwargs={'pk': self.product._id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Wishlist.objects.filter(user=self.user, product=self.product).exists())

    def test_add_in_stock_item_to_wishlist(self):
        """Test that in-stock items cannot be added to wishlist"""
        self.product.stockCount = 5
        self.product.save()
        url = reverse('wishlist-item', kwargs={'pk': self.product._id})
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_remove_from_wishlist(self):
        """Test removing an item from wishlist"""
        Wishlist.objects.create(user=self.user, product=self.product)
        url = reverse('wishlist-item', kwargs={'pk': self.product._id})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Wishlist.objects.filter(user=self.user, product=self.product).exists())
