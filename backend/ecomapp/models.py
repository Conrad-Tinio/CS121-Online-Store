from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

class TagType(models.Model):
    COLOR_CHOICES = [
        ('primary', 'Blue'),
        ('danger', 'Red'),
        ('warning', 'Yellow'),
        ('dark', 'Black'),
    ]

    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(null=True, blank=True)
    color = models.CharField(
        max_length=20,
        choices=COLOR_CHOICES,
        default='primary',
        help_text='Choose the display color for this tag type'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Tag Type'
        verbose_name_plural = 'Tag Types'

    def __str__(self):
        return self.name

class Tag(models.Model):
    name = models.CharField(max_length=50)
    tag_type = models.ForeignKey(TagType, on_delete=models.CASCADE, related_name='tags', null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['tag_type__name', 'name']
        unique_together = ['name', 'tag_type']  # Ensure tag names are unique within their type
        verbose_name = 'Tag'
        verbose_name_plural = 'Tags'

    def __str__(self):
        return f"{self.tag_type.name if self.tag_type else 'Uncategorized'}: {self.name}"

class Products(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    productName = models.CharField(max_length=200, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    image = models.ImageField(null=True, blank=True)
    productBrand = models.CharField(max_length=100, null=True, blank=True)
    productInfo = models.TextField(null=True, blank=True)
    rating = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    numReviews = models.IntegerField(null=True, blank=True, default=0)
    price = models.DecimalField(max_digits=7, decimal_places=2, null=True, blank=True)
    stockCount = models.IntegerField(null=True, blank=True, default=0)
    createdAt = models.DateTimeField(auto_now_add=True)
    _id = models.AutoField(primary_key=True, editable=False)
    tags = models.ManyToManyField(Tag, related_name='products', blank=True, help_text="Select tags to associate with this product")

    def __str__(self):
        return self.productName or "New Product"

class DeliveryLocation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    address_details = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s location ({self.latitude}, {self.longitude})"

class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    delivery_location = models.ForeignKey(DeliveryLocation, on_delete=models.SET_NULL, null=True)
    payment_method = models.CharField(max_length=200)
    shipping_price = models.DecimalField(max_digits=7, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    is_delivered = models.BooleanField(default=False)
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Products, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=7, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product.productName} in Order {self.order.id}"

class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Products, on_delete=models.CASCADE)
    added_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"{self.user.username}'s wishlist - {self.product.productName}"