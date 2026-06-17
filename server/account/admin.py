from django.contrib import admin
from .models import Account, JournalEntry, JournalItem

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    # What to show in the list view
    list_display = ('code', 'name', 'group', 'get_balance', 'is_active')
    list_filter = ('group', 'is_active')
    search_fields = ('code', 'name')
    ordering = ('code',)

    # We use a custom method to display the dynamic property in the admin panel
    def get_balance(self, obj):
        return obj.balance
    get_balance.short_description = 'Current Balance'


class JournalItemInline(admin.TabularInline):
    """Shows the Debits and Credits directly inside the Journal Entry page"""
    model = JournalItem
    extra = 0
    # Strict Accounting: Prevent tampering with automated items
    readonly_fields = ('account', 'debit', 'credit')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'date', 'description', 'get_related_doc')
    list_filter = ('date',)
    search_fields = ('description',)
    inlines = [JournalItemInline]
    
    # Strict Accounting: Prevent tampering with the main entry
    readonly_fields = ('date', 'description', 'purchase', 'sale')

    def get_related_doc(self, obj):
        """Cleanly shows if this entry came from a Purchase or a Sale"""
        if obj.purchase:
            return f"Purchase #{obj.purchase.purchase_id}"
        elif obj.sale:
            return f"Sale #{obj.sale.id}" # Adjust if your Sale model uses a different ID field
        return "-"
    get_related_doc.short_description = 'Related Document'

    # Security: Disable manual creation and deletion of Journal Entries
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(JournalItem)
class JournalItemAdmin(admin.ModelAdmin):
    """Optional: Allows you to view all individual debit/credit lines across the whole company"""
    list_display = ('journal_entry', 'account', 'debit', 'credit')
    list_filter = ('account',)
    search_fields = ('account__name', 'account__code')
    
    # Strict Accounting: Read-only
    readonly_fields = ('journal_entry', 'account', 'debit', 'credit')

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False