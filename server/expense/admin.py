from django.contrib import admin
from .models import Expense

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('expense_id', 'expense_date', 'main_category', 'sub_category', 'employee_recipient', 'amount', 'payment_method')
    list_filter = ('main_category', 'payment_method', 'expense_date')
    search_fields = ('expense_id', 'transaction_id', 'remarks')
    readonly_fields = ('expense_id',)