from django.contrib import admin
from .models import Purchase

class PurchaseAdmin(admin.ModelAdmin):
    list_display = ('purchase_id', 'product', 'quantity', 'unit_cost_bdt', 'total_cost_bdt', 'supplier_name', 'entry_by', 'purchase_date')
    search_fields = ('purchase_id', 'product__product_name', 'invoice_number', 'supplier_name')
    list_filter = ('purchase_date', 'entry_by')
    readonly_fields = ('purchase_id', 'total_cost_bdt', 'purchase_date')

admin.site.register(Purchase, PurchaseAdmin)