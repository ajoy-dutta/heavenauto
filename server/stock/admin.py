from django.contrib import admin
from .models import Stock

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('product', 'current_quantity', 'last_updated')
    search_fields = ('product__product_name', 'product__part_number')
    
    # This prevents manual editing of stock in the admin panel to ensure ledger accuracy
    readonly_fields = ('current_quantity', 'product')