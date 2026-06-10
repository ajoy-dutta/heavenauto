# server/person/admin.py
from django.contrib import admin
from .models import Employee, Education, PreviousWork, Customer

# --- Employee Admin Setup ---
class EducationInline(admin.TabularInline):
    model = Education
    extra = 1

class PreviousWorkInline(admin.TabularInline):
    model = PreviousWork
    extra = 1

class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        'employee_id', 'full_name', 'joining_date', 'mobile1',
        'gender', 'blood_group', 'dob', 'age', 'religion',
        'father_name', 'mother_name', 'nid_no', 'birth_id_no', 
        'passport_no', 'nationality', 'email', 'mobile2', 
        'mobile_father', 'mobile_mother', 'mobile_others',
        'acc_name', 'acc_no', 'bank_name', 'branch_name',
        'bkash_no', 'nagad_no', 'rocket_no'
    )
    list_filter = ('joining_date', 'gender', 'blood_group', 'religion')
    search_fields = ('employee_id', 'full_name', 'mobile1', 'nid_no')
    readonly_fields = ('employee_id',)
    
    fieldsets = (
        ('Account Info', {'fields': ('employee_id', 'joining_date', 'picture')}),
        ('Personal Details', {'fields': ('full_name', 'father_name', 'mother_name', 'gender', 'blood_group', 'dob', 'age', 'religion')}),
        ('Identification', {'fields': ('birth_id_no', 'nid_no', 'passport_no', 'nationality')}),
        ('Contact Information', {'fields': ('email', 'mobile1', 'mobile2', 'mobile_father', 'mobile_mother', 'mobile_others')}),
        ('Bank Details', {'fields': ('acc_name', 'acc_no', 'bank_name', 'branch_name'), 'classes': ('collapse',)}),
        ('Mobile Banking', {'fields': ('bkash_no', 'nagad_no', 'rocket_no'), 'classes': ('collapse',)}),
    )
    inlines = [EducationInline, PreviousWorkInline]

# --- Customer Admin Setup ---
class CustomerAdmin(admin.ModelAdmin):
    # What shows up on the main table
    list_display = ('customer_id', 'proprietor_name', 'shop_name', 'mobile1', 'customer_type', 'entry_date_time')
    list_filter = ('customer_type', 'division', 'district', 'entry_date_time')
    search_fields = ('customer_id', 'proprietor_name', 'shop_name', 'mobile1', 'nid')
    readonly_fields = ('customer_id', 'entry_date_time')
    
    # How it looks when you click into a specific customer
    fieldsets = (
        ('System Info', {
            'fields': ('customer_id', 'entry_date_time', 'entry_by', 'picture')
        }),
        ('Personal & Shop Details', {
            'fields': ('customer_type', 'shop_name', 'proprietor_name', 'employee_name', 'age', 'nid')
        }),
        ('Contact Information', {
            'fields': ('mobile1', 'mobile2', 'email')
        }),
        ('Address', {
            'fields': ('country', 'division', 'district', 'police_station', 'post_office', 'town_village', 'market_name')
        }),
        ('Additional Info', {
            'fields': ('referred_by', 'note_remarks')
        }),
    )

# Registering the models
admin.site.register(Employee, EmployeeAdmin)
admin.site.register(Customer, CustomerAdmin)