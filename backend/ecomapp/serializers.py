from rest_framework import serializers
from .models import Products, Category, DeliveryLocation, Order, OrderItem, Wishlist
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductsSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = serializers.SerializerMethodField()
    arrival_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Products
        fields = ['_id', 'user', 'productName', 'category', 'image', 'productBrand',
                'productInfo', 'rating', 'numReviews', 'price', 'stockCount', 'createdAt', 'tags', 'arrival_status']

    def get_tags(self, obj):
        # Debug print
        print(f"\nDebug - get_tags for {obj.productName}:")
        all_tags = obj.tags.select_related('tag_type').all()
        print(f"Raw query: {all_tags.query}")
        print(f"Number of tags: {all_tags.count()}")
        
        # Get all tags with their types and colors
        tags_data = []
        for tag in all_tags:
            tag_data = {
                'id': tag.id,
                'name': tag.name,
                'tag_type': tag.tag_type.name if tag.tag_type else 'Uncategorized',
                'color': tag.tag_type.color if tag.tag_type else 'secondary'
            }
            tags_data.append(tag_data)
            print(f"Added tag: {tag_data}")
        
        return tags_data

    def get_arrival_status(self, obj):
        # Get arrival tag if it exists
        arrival_tag = obj.tags.filter(tag_type__name='Arrival').first()
        if arrival_tag:
            return arrival_tag.name.lower()  # Convert 'New' to 'new', etc.
        return 'classic'  # Default value if no arrival tag is found

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    _id = serializers.SerializerMethodField(read_only=True)
    isAdmin = serializers.SerializerMethodField(read_only=True)
   
    class Meta:
        model = User
        fields = ['id', '_id', 'username', 'email', 'name', 'isAdmin']
    
    def get_name(self, obj):
        name = obj.first_name
        if name == '':
            name = obj.email
        return name
    
    def get__id(self, obj):
        return obj.id

    def get_isAdmin(self, obj):
        return obj.is_staff
    
    
class UserSerializerWithToken(UserSerializer):
    token = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User
        fields = ['id', '_id', 'username', 'email', 'name', 'isAdmin', 'token']
    
    def get_token(self, obj):
        token = RefreshToken.for_user(obj)
        return str(token.access_token)

class DeliveryLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryLocation
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductsSerializer()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    delivery_location = DeliveryLocationSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'delivery_location', 'payment_method', 'shipping_price',
                 'total_price', 'status', 'is_paid', 'paid_at', 'is_delivered',
                 'delivered_at', 'created_at', 'items']

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductsSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'product', 'added_date']