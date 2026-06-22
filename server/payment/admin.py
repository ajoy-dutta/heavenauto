from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('payment_id', 'payment_type', 'amount', 'payment_method', 'payment_date')
    list_filter = ('payment_type', 'payment_method')
    search_fields = ('payment_id', 'transaction_id', 'sale__invoice_number', 'purchase__po_number')