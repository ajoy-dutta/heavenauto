import uuid
from django.db import models
from person.models import Employee

# --- NEW CATEGORY MODEL ---
class CapitalCategory(models.Model):
    name = models.CharField(max_length=100, unique=True, help_text="e.g., Owner Investment, Bank Loan")
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

# --- UPDATED CAPITAL MODEL ---
class Capital(models.Model):
    # Payment Method Choices
    PAYMENT_METHOD_CHOICES = [
        ('Cash', 'Cash'),
        ('Bank', 'Bank Transfer / Cheque'),
        ('MFS', 'Mobile Financial Service (bKash, Nagad, etc.)'),
    ]

    # MFS Provider Choices
    MFS_PROVIDER_CHOICES = [
        ('bKash', 'bKash'),
        ('Nagad', 'Nagad'),
        ('Rocket', 'Rocket'),
        ('Upay', 'Upay'),
        ('Other', 'Other'),
    ]

    capital_id = models.CharField(max_length=20, unique=True, editable=False)
    
    # Linked to the Category model
    category = models.ForeignKey(CapitalCategory, on_delete=models.PROTECT, related_name='capitals')
    
    source_name = models.CharField(max_length=255, help_text="Name of the owner, bank, or lender")
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    transaction_date = models.DateField()
    
    # --- NEW PAYMENT DETAILS ---
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='Cash')
    
    # Bank Details (Used if payment_method == 'Bank')
    bank_name = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., BRAC Bank, City Bank")
    bank_account_no = models.CharField(max_length=100, blank=True, null=True)
    cheque_number = models.CharField(max_length=100, blank=True, null=True)
    
    # MFS Details (Used if payment_method == 'MFS')
    mfs_provider = models.CharField(max_length=50, choices=MFS_PROVIDER_CHOICES, blank=True, null=True)
    mfs_phone_number = models.CharField(max_length=20, blank=True, null=True, help_text="e.g., +88017XXXXXXXX")
    mfs_transaction_id = models.CharField(max_length=100, blank=True, null=True, help_text="TrxID")
    # ---------------------------

    remarks = models.TextField(blank=True, null=True, help_text="Any specific notes or terms of the loan/investment")
    
    # Audit Trail
    entry_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.capital_id:
            self.capital_id = f"CAP-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.category.name} - {self.source_name} (BDT {self.amount})"