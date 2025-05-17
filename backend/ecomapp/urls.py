from ecomapp import views
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
)

urlpatterns = [
    path('', views.getRoutes, name="getRoutes"),
    path('products/', views.getProducts, name="getProducts"),
    path('categories/', views.getCategories, name="getCategories"),
    path('product/<str:pk>', views.getProduct, name="getProduct"),
    path('users/login/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/profile/',views.getUserProfile,name="getUserProfile"),
    path('users/',views.getUser,name="getUser"),
    path('users/register/', views.registerUser, name="register"), 
    path('activate/<uidb64>/<token>',views.ActivateAccountView.as_view(),name='activate'),
    path('products/update-stock/', views.update_stock, name='update-stock'),
    path('orders/myorders/', views.get_my_orders, name='my-orders'),
    path('orders/create/', views.create_order, name='create-order'),
    path('orders/<str:pk>/', views.get_order_details, name='order-details'),
    path('admin/sales-stats/', views.get_sales_stats, name='sales-stats'),
    path('wishlist/', views.wishlist_operations, name='wishlist'),
    path('wishlist/<str:pk>/', views.wishlist_operations, name='wishlist-item'),
    path('tag-types/', views.get_tag_types, name='tag-types'),
]