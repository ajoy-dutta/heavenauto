from django.contrib import admin
from .models import Stock

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('product', 'current_quantity', 'last_updated')
    search_fields = ('product__product_name', 'product__part_number')
    
    # Block editing entirely from the Django panel
    readonly_fields = ('product', 'current_quantity', 'last_updated') 
    
    def has_add_permission(self, request):
        return False # Hide the "Add Stock" button