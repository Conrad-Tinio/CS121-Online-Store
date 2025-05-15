from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status

# from .products import products
from .models import Products, Category
from .serializers import ProductsSerializer, UserSerializer, UserSerializerWithToken, CategorySerializer

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
    min_price = request.query_params.get('min_price')
    max_price = request.query_params.get('max_price')
    
    # Start with all products
    products = Products.objects.all()
    
    # Filter by category if specified
    if category:
        products = products.filter(category__name__iexact=category)
    
    # Filter by search query
    if query:
        products = products.filter(productName__icontains=query)
    
    # Filter by price range
    if min_price:
        products = products.filter(price__gte=float(min_price))
    if max_price:
        products = products.filter(price__lte=float(max_price))
    
    # Order by name
    products = products.order_by('productName')
    
    serializer = ProductsSerializer(products, many=True)
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
        return Response(message)
    except Exception as e:
        message={'details': "User with this email already exists or something went wrong."}
        return Response(message)

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