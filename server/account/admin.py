from django.contrib import admin
from .models import Account, Ledger

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    # Display the dynamic property in the list view
    list_display = ('code', 'name', 'group', 'get_balance')
    search_fields = ('code', 'name')
    list_filter = ('group',)

    # Custom method to format the balance property for the admin panel
    def get_balance(self, obj):
        return f"৳ {obj.balance}"
    get_balance.short_description = 'Live Balance'


@admin.register(Ledger)
class LedgerAdmin(admin.ModelAdmin):
    list_display = ('account', 'date', 'description', 'content_type', 'object_id', 'debit', 'credit')
    list_filter = ('account', 'content_type', 'date')
    search_fields = ('description', 'object_id', 'account__name', 'account__code')
    readonly_fields = ('date',)
    
    # Optional: order by newest first
    ordering = ('-date',)