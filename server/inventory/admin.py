from django.contrib import admin
from django.urls import reverse
from django.utils.html import format_html
from .models import Product, Purchase, Sale

class PurchaseInline(admin.TabularInline):
    model = Purchase
    extra = 1
    readonly_fields = ('purchased_at', 'total_cost')

class SaleInline(admin.TabularInline):
    model = Sale
    extra = 1
    # Making these read-only prevents errors since they are auto-calculated in models.py
    readonly_fields = ('total_price', 'profit', 'sold_at', 'unit_price')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'category', 'purchase_price', 'sale_price', 'stock_quantity', 'stock_status')
    search_fields = ('name', 'brand', 'category')
    list_filter = ('category', 'brand')
    inlines = [PurchaseInline, SaleInline]
    fieldsets = (
        ('Product Information', {
            'fields': ('name', 'brand', 'category')
        }),
        ('Pricing', {
            'fields': ('purchase_price', 'sale_price')
        }),
        ('Inventory', {
            'fields': ('stock_quantity',)
        }),
    )
    
    def stock_status(self, obj):
        if obj.stock_quantity <= 0:
            return format_html('<span style="color: red;">Out of Stock</span>')
        elif obj.stock_quantity < 10:
            return format_html('<span style="color: orange;">Low Stock ({})</span>', obj.stock_quantity)
        else:
            return format_html('<span style="color: green;">In Stock ({})</span>', obj.stock_quantity)
    stock_status.short_description = 'Stock Status'

@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('product_link', 'quantity', 'unit_price', 'total_cost', 'purchased_at', 'purchased_by')
    list_filter = ('purchased_at', 'purchased_by')
    readonly_fields = ('total_cost',)
    search_fields = ('product__name',)
    
    def product_link(self, obj):
        return format_html('<a href="{}">{}</a>', 
                          reverse('admin:inventory_product_change', args=[obj.product.pk]),
                          obj.product.name)
    product_link.short_description = 'Product'
    
    def unit_price(self, obj):
        return obj.product.purchase_price
    unit_price.short_description = 'Unit Price'

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('product_link', 'customer_link', 'quantity', 'unit_price', 'total_price', 'profit', 'margin_percentage', 'sold_at')
    list_filter = ('sold_at', 'sold_by', 'customer')
    readonly_fields = ('total_price', 'profit', 'sold_at')
    search_fields = ('product__name', 'customer__proprietor_name')
    
    def product_link(self, obj):
        return format_html('<a href="{}">{}</a>', 
                          reverse('admin:inventory_product_change', args=[obj.product.pk]),
                          obj.product.name)
    product_link.short_description = 'Product'
    
    def customer_link(self, obj):
        return format_html('<a href="{}">{}</a>', 
                          reverse('admin:person_customer_change', args=[obj.customer.pk]),
                          obj.customer.proprietor_name)
    customer_link.short_description = 'Customer'
    
    def margin_percentage(self, obj):
        if obj.total_price:
            margin = (obj.profit / obj.total_price) * 100
            return f"{margin:.1f}%"
        return "0%"
    margin_percentage.short_description = 'Margin %'