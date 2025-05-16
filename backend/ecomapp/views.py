from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status

# from .products import products
from .models import Products, Category, Order, OrderItem, DeliveryLocation, Wishlist
from .serializers import ProductsSerializer, UserSerializer, UserSerializerWithToken, CategorySerializer, OrderSerializer, DeliveryLocationSerializer, WishlistSerializer

# for sending mails and generate token
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_decode,urlsafe_base64_encode
from .utils import TokenGenerator,generate_token
from django.utils.encoding import force_bytes,force_text,DjangoUnicodeDecodeError
from django.core.mail import EmailMessage
from django.conf import settings
from django.views.generic import View

import threading
from django.db import transaction
from decimal import Decimal

class EmailThread(threading.Thread):
    def __init__(self, email_message):
        self.email_message = email_message
        threading.Thread.__init__(self)

    def run(self):
        self.email_message.send()

@api_view(['GET'])
def getRoutes(request):
    return Response('Hello Anees')


@api_view(['GET'])
def getProducts(request):
    query = request.query_params.get('keyword', '')
    category = request.query_params.get('category', '')
    stock_filter = request.query_params.get('stock', '')
    price_range = request.query_params.get('price_range', '')
    
    print(f"\n{'='*50}")
    print("Processing product filter request")
    print(f"{'='*50}")
    print("\nReceived filter parameters:")
    print(f"- Category: {category}")
    print(f"- Stock filter: {stock_filter}")
    print(f"- Price range: {price_range}")
    print(f"- Search query: {query}")
    
    # Start with all products
    products = Products.objects.all()
    initial_count = products.count()
    print(f"\nInitial product count: {initial_count}")
    
    # Print all products and their details before filtering
    print("\nAll products before filtering:")
    for p in products:
        print(f"- {p.productName}: Price=₱{p.price}, Stock={p.stockCount}")
    
    # Define exact price ranges with Decimal for precise comparison
    PRICE_RANGES = {
        'budget': (Decimal('0.00'), Decimal('999.99')),
        'midRange': (Decimal('1000.00'), Decimal('4999.99')),
        'premium': (Decimal('5000.00'), Decimal('999999.99'))
    }
    
    # Define stock ranges with exact boundaries
    STOCK_RANGES = {
        'inStock': Q(stockCount__gt=10),
        'lowStock': Q(stockCount__gt=0) & Q(stockCount__lte=10),
        'outOfStock': Q(stockCount=0)
    }
    
    # Initialize filters list
    filters = []
    
    # Add category filter
    if category:
        cat_filter = Q(category__name__iexact=category)
        filters.append(cat_filter)
        print(f"\nAdding category filter: {category}")
    
    # Add stock filter
    if stock_filter and stock_filter in STOCK_RANGES:
        stock_q = STOCK_RANGES[stock_filter]
        filters.append(stock_q)
        print(f"\nAdding stock filter: {stock_filter}")
        print(f"Stock condition: {stock_q}")
    
    # Add price range filter
    if price_range and price_range in PRICE_RANGES:
        min_val, max_val = PRICE_RANGES[price_range]
        price_q = Q(price__gte=min_val) & Q(price__lt=max_val)
        filters.append(price_q)
        print(f"\nAdding price range filter: {price_range}")
        print(f"Price range: ₱{min_val} <= price < ₱{max_val}")
        print(f"SQL query part: {price_q}")
    
    # Add search query filter
    if query:
        query_q = Q(productName__icontains=query)
        filters.append(query_q)
        print(f"\nAdding search filter: {query}")
    
    # Apply all filters using AND operation
    if filters:
        # Combine all filters with AND
        final_filter = filters.pop(0)
        for f in filters:
            final_filter &= f
        print(f"\nApplying combined filters: {final_filter}")
        products = products.filter(final_filter)
    
    # Verify each product meets ALL criteria
    print("\nVerifying filtered products:")
    products_to_remove = []
    
    for p in products:
        print(f"\nChecking product: {p.productName}")
        print(f"- Price: ₱{p.price}")
        print(f"- Stock: {p.stockCount}")
        
        meets_all_criteria = True
        
        # Verify category
        if category:
            meets_category = p.category.name.lower() == category.lower()
            print(f"Category check:")
            print(f"- Required: {category}")
            print(f"- Actual: {p.category.name}")
            print(f"- Matches: {meets_category}")
            meets_all_criteria &= meets_category
        
        # Verify stock status
        if stock_filter:
            if stock_filter == 'inStock':
                meets_stock = p.stockCount > 10
            elif stock_filter == 'lowStock':
                meets_stock = 0 < p.stockCount <= 10
            else:  # outOfStock
                meets_stock = p.stockCount == 0
            print(f"Stock check ({stock_filter}):")
            print(f"- Required: {stock_filter}")
            print(f"- Actual: {p.stockCount}")
            print(f"- Matches: {meets_stock}")
            meets_all_criteria &= meets_stock
            
        # Verify price range
        if price_range and price_range in PRICE_RANGES:
            min_val, max_val = PRICE_RANGES[price_range]
            meets_price = min_val <= p.price < max_val
            print(f"Price range check ({price_range}):")
            print(f"- Required: ₱{min_val} <= price < ₱{max_val}")
            print(f"- Actual: ₱{p.price}")
            print(f"- Matches: {meets_price}")
            meets_all_criteria &= meets_price
        
        if not meets_all_criteria:
            print("❌ Product does not meet all criteria - will be removed")
            products_to_remove.append(p.id)
        else:
            print("✓ Product meets all criteria")
    
    # Remove products that don't meet all criteria
    if products_to_remove:
        products = products.exclude(id__in=products_to_remove)
    
    # Order by name
    products = products.order_by('productName')
    
    serializer = ProductsSerializer(products, many=True)
    final_count = len(serializer.data)
    print(f"\nFinal product count: {final_count}")
    
    if final_count > 0:
        print("\nFinal products:")
        for p in products:
            print(f"- {p.productName}: Price=₱{p.price}, Stock={p.stockCount}")
    else:
        print("\nNo products match all filters")
    
    print(f"\n{'='*50}")
    return Response(serializer.data)


@api_view(['GET'])
def getProduct(request,pk):
    product=Products.objects.get(_id=pk)
    serializer=ProductsSerializer(product,many=False)
    return Response(serializer.data)



class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        serializer=UserSerializerWithToken(self.user).data
        for k,v in serializer.items():
            data[k]=v       
        return data


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class=MyTokenObtainPairSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def  getUserProfile(request):
    user=request.user
    serializer=UserSerializer(user,many=False)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def getUser(request):
    users=User.objects.all()
    serializer=UserSerializer(users,many=True)
    return Response(serializer.data)


@api_view(['POST'])
def registerUser(request):
    data=request.data
    try:
        # Check if email already exists - explicitly check before creation
        if User.objects.filter(email=data['email']).exists():
            return Response({'details': "A user with this email already exists."}, status=status.HTTP_400_BAD_REQUEST)
            
        user= User.objects.create(first_name=data['fname'],
                                  last_name=data['lname'],
                                  username=data['email'],
                                  email=data['email'],
                                  password=make_password(data['password']),
                                  is_active=False)
      
        # generate token for sending mail
        email_subject="Activate Your Account"
        message=render_to_string(
            "activate.html",
           {
            'user':user,
            'domain':'127.0.0.1:8000',
            'uid':urlsafe_base64_encode(force_bytes(user.pk)),
            'token':generate_token.make_token(user)
           }

        )
        # print(message)
        email_message=EmailMessage(email_subject,message,settings.EMAIL_HOST_USER,[data['email']])
        EmailThread(email_message).start()
        # serialize=UserSerializerWithToken(user,many=False)
        message={'details': "Please check your email to activate your account."} 
        return Response(message, status=status.HTTP_201_CREATED)
    except KeyError as e:
        return Response({'details': f"Missing required field: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'details': "Something went wrong during registration."}, status=status.HTTP_400_BAD_REQUEST)

class ActivateAccountView(View):
    def get(self,request,uidb64,token):
        try:
            uid=force_text(urlsafe_base64_decode(uidb64))
            user=User.objects.get(pk=uid)
        except Exception as identifier:
            user=None
        if user is not None and generate_token.check_token(user,token):
            user.is_active=True
            user.save()
            return render(request,"activatesuccess.html")
        else:
            return render(request,"activatefail.html")   

@api_view(['POST'])
def update_stock(request):
    try:
        with transaction.atomic():
            product_id = request.data.get('productId')
            quantity = request.data.get('quantity')
            
            if not product_id or not quantity:
                return Response({'detail': 'Product ID and quantity are required'}, status=status.HTTP_400_BAD_REQUEST)
            
            product = Products.objects.get(_id=product_id)
            if product.stockCount < quantity:
                return Response({'detail': 'Not enough stock available'}, status=status.HTTP_400_BAD_REQUEST)
            
            product.stockCount -= quantity
            product.save()
            
            return Response({'detail': 'Stock updated successfully'}, status=status.HTTP_200_OK)
            
    except Products.DoesNotExist:
        return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)   

@api_view(['GET'])
def getCategories(request):
    categories = Category.objects.all().order_by('name')
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)   

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_orders(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)   

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_order(request):
    try:
        data = request.data
        user = request.user

        # Get or create delivery location
        delivery_location = None
        if data.get('delivery_location'):
            loc_data = data['delivery_location']
            delivery_location = DeliveryLocation.objects.create(
                user=user,
                latitude=loc_data['latitude'],
                longitude=loc_data['longitude'],
                address_details=loc_data['address_details']
            )

        # Create order
        order = Order.objects.create(
            user=user,
            delivery_location=delivery_location,
            payment_method=data['payment_method'],
            shipping_price=data['shipping_price'],
            total_price=data['total_price'],
            status='Pending'
        )

        # Create order items
        for item in data['order_items']:
            product = Products.objects.get(_id=item['product_id'])
            
            # Check stock
            if product.stockCount < item['quantity']:
                order.delete()  # Rollback the order
                return Response({
                    'detail': f'Not enough stock for {product.productName}. Available: {product.stockCount}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create order item
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=item['price']
            )
            
            # Update stock
            product.stockCount -= item['quantity']
            product.save()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except KeyError as e:
        return Response({
            'detail': f'Missing required field: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Products.DoesNotExist:
        return Response({
            'detail': 'One or more products not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'detail': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)   

@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_sales_stats(request):
    try:
        # Get time periods
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = today.replace(day=1)

        # Overall stats
        total_orders = Order.objects.count()
        total_sales = Order.objects.aggregate(total=Sum('total_price'))['total'] or 0

        # Today's stats
        today_orders = Order.objects.filter(created_at__date=today)
        today_sales = today_orders.aggregate(total=Sum('total_price'))['total'] or 0
        today_order_count = today_orders.count()

        # This week's stats
        week_orders = Order.objects.filter(created_at__date__gte=start_of_week)
        week_sales = week_orders.aggregate(total=Sum('total_price'))['total'] or 0
        week_order_count = week_orders.count()

        # This month's stats
        month_orders = Order.objects.filter(created_at__date__gte=start_of_month)
        month_sales = month_orders.aggregate(total=Sum('total_price'))['total'] or 0
        month_order_count = month_orders.count()

        # Status breakdown
        status_breakdown = Order.objects.values('status').annotate(
            count=Count('id'),
            total=Sum('total_price')
        )

        # Best selling products
        best_sellers = OrderItem.objects.values(
            'product__productName',
            'product__price'
        ).annotate(
            total_quantity=Sum('quantity'),
            total_sales=Sum('price')
        ).order_by('-total_quantity')[:5]

        return Response({
            'overall': {
                'total_orders': total_orders,
                'total_sales': float(total_sales),
            },
            'today': {
                'orders': today_order_count,
                'sales': float(today_sales),
            },
            'week': {
                'orders': week_order_count,
                'sales': float(week_sales),
            },
            'month': {
                'orders': month_order_count,
                'sales': float(month_sales),
            },
            'status_breakdown': status_breakdown,
            'best_sellers': best_sellers
        })

    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)   

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def wishlist_operations(request, pk=None):
    try:
        if request.method == 'GET':
            wishlist_items = Wishlist.objects.filter(user=request.user)
            serializer = WishlistSerializer(wishlist_items, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            try:
                product = Products.objects.get(_id=pk)
            except Products.DoesNotExist:
                return Response({'detail': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Check if product is in stock
            if product.stockCount > 0:
                return Response({'detail': 'Product is in stock. Add to cart instead.'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if already in wishlist
            wishlist_exists = Wishlist.objects.filter(user=request.user, product=product).exists()
            if wishlist_exists:
                return Response({'detail': 'Product already in wishlist'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Add to wishlist
            wishlist = Wishlist.objects.create(
                user=request.user,
                product=product
            )
            serializer = WishlistSerializer(wishlist)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        elif request.method == 'DELETE':
            try:
                wishlist_item = Wishlist.objects.get(user=request.user, product___id=pk)
                wishlist_item.delete()
                return Response({'detail': 'Item removed from wishlist'})
            except Wishlist.DoesNotExist:
                return Response({'detail': 'Item not found in wishlist'}, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)   