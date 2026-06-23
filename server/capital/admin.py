from django.contrib import admin
from .models import Capital, CapitalCategory

@admin.register(CapitalCategory)
class CapitalCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name',)

@admin.register(Capital)
class CapitalAdmin(admin.ModelAdmin):
    list_display = ('capital_id', 'category', 'source_name', 'amount', 'transaction_date')
    list_filter = ('category', 'transaction_date')
    search_fields = ('source_name', 'capital_id')
    readonly_fields = ('capital_id', 'created_at')