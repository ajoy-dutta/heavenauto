from django.contrib import admin
from .models import Sale

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('sale_id', 'product', 'customer', 'quantity', 'total_price_bdt', 'sale_date')
    list_filter = ('sale_date', 'employee')
    search_fields = ('sale_id', 'invoice_number', 'product__product_name')