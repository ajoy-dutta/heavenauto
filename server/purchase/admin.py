from django.contrib import admin
from .models import PurchaseOrder, PurchaseItem

class PurchaseItemInline(admin.TabularInline):
    model = PurchaseItem
    extra = 1
    readonly_fields = ('total_cost_bdt',)

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    # Only show the relevant data
    list_display = ('po_number', 'supplier', 'total_amount', 'payment_status', 'purchase_date')
    search_fields = ('po_number', 'supplier__name')
    list_filter = ('payment_status',)
    
    readonly_fields = ('po_number', 'total_amount')
    inlines = [PurchaseItemInline]