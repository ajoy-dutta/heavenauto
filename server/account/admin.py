from django.contrib import admin
from .models import Account, Ledger

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    # 'is_active' was removed because it wasn't in the latest model definition
    list_display = ('code', 'name', 'group', 'opening_balance', 'current_balance')
    list_filter = ('group',)
    search_fields = ('code', 'name')
    ordering = ('code',)

    def current_balance(self, obj):
        return obj.balance
    
    current_balance.short_description = 'Current Balance'


@admin.register(Ledger)
class LedgerAdmin(admin.ModelAdmin):
    # 'source_app' was updated to 'content_type' to match the model we defined
    list_display = ('date', 'account', 'description', 'debit', 'credit', 'content_type')
    list_filter = ('content_type', 'date', 'account__group')
    search_fields = ('description', 'account__name', 'account__code', 'object_id')
    autocomplete_fields = ('account',)
    ordering = ('-date', '-id')