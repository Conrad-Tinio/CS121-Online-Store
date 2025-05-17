from django.contrib import admin
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from django.utils.html import format_html, mark_safe
from .models import Products, Category, Order, OrderItem, TagType, Tag

@admin.register(TagType)
class TagTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'color_badge', 'description', 'created_at', 'get_tags_count']
    search_fields = ['name', 'description']
    ordering = ['name']
    list_filter = ['color']

    def color_badge(self, obj):
        return format_html(
            '<span class="badge bg-{}" style="padding: 8px;">{}</span>',
            obj.color,
            dict(obj.COLOR_CHOICES)[obj.color]
        )
    color_badge.short_description = 'Color'

    def get_tags_count(self, obj):
        return obj.tags.count()
    get_tags_count.short_description = 'Number of Tags'

    class Media:
        css = {
            'all': [
                'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
            ]
        }

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'tag_type', 'created_at', 'get_products_count']
    list_filter = ['tag_type']
    search_fields = ['name', 'tag_type__name']
    ordering = ['tag_type__name', 'name']
    autocomplete_fields = ['tag_type']
    list_select_related = ['tag_type']

    def get_products_count(self, obj):
        return obj.products.count()
    get_products_count.short_description = 'Used in Products'

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "tag_type":
            kwargs["queryset"] = TagType.objects.order_by('name')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']
    ordering = ['name']

@admin.register(Products)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['productName', 'category', 'price', 'stockCount', 'rating', 'get_tags']
    list_filter = ['category', 'createdAt', 'tags__tag_type']
    search_fields = ['productName', 'description']
    ordering = ['productName']
    filter_horizontal = ['tags']
    readonly_fields = ['get_tags_display']
    fieldsets = [
        (None, {
            'fields': ['productName', 'category', 'image', 'productBrand', 'productInfo']
        }),
        ('Product Details', {
            'fields': ['price', 'stockCount', 'rating', 'numReviews']
        }),
        ('Tags', {
            'fields': ['tags', 'get_tags_display'],
            'description': 'Select tags for this product. You can select multiple tags by holding Ctrl/Cmd.'
        })
    ]

    def formatted_price(self, obj):
        if obj.price is None:
            return '-'
        return format_html('₱{:,.2f}', obj.price)
    formatted_price.short_description = 'Price'

    def get_tags(self, obj):
        tags = obj.tags.select_related('tag_type').all()
        return ", ".join([f"{tag.tag_type.name}: {tag.name}" for tag in tags]) or "No tags"
    get_tags.short_description = 'Tags'

    def get_tags_display(self, obj):
        tags = obj.tags.select_related('tag_type').all()
        if not tags:
            return "No tags assigned"
        html = "<ul>"
        for tag_type in TagType.objects.all():
            type_tags = [tag for tag in tags if tag.tag_type == tag_type]
            if type_tags:
                html += f"<li><strong>{tag_type.name}:</strong> "
                html += ", ".join([tag.name for tag in type_tags])
                html += "</li>"
        html += "</ul>"
        return mark_safe(html)
    get_tags_display.short_description = 'Current Tags'

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'quantity', 'price']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total_price', 'created_at', 'get_order_summary']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username', 'id']
    ordering = ['-created_at']
    readonly_fields = ['user', 'delivery_location', 'payment_method', 'shipping_price', 'total_price']
    inlines = [OrderItemInline]
    change_list_template = 'admin/ecomapp/order/change_list.html'

    def get_order_summary(self, obj):
        items = obj.items.all()
        summary = "<br>".join([f"{item.quantity}x {item.product.productName} (₱{item.price})" for item in items])
        return format_html(summary)
    get_order_summary.short_description = 'Order Items'

    def changelist_view(self, request, extra_context=None):
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

        extra_context = extra_context or {}
        extra_context.update({
            'total_orders': total_orders,
            'total_sales': total_sales,
            'today_orders': today_order_count,
            'today_sales': today_sales,
            'week_orders': week_order_count,
            'week_sales': week_sales,
            'month_orders': month_order_count,
            'month_sales': month_sales,
            'status_breakdown': status_breakdown,
            'best_sellers': best_sellers,
        })

        return super().changelist_view(request, extra_context=extra_context)
