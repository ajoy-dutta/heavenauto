from django.db import models
from django.db.models import Sum
from decimal import Decimal

class Account(models.Model):
    GROUP_CHOICES = [
        ('Asset', 'Asset'),
        ('Liability', 'Liability'),
        ('Equity', 'Equity'),
        ('Revenue', 'Revenue'),
        ('Expense', 'Expense'),
    ]
    
    code = models.CharField(max_length=20, unique=True, help_text="e.g., 1000 for Cash")
    name = models.CharField(max_length=100)
    group = models.CharField(max_length=20, choices=GROUP_CHOICES)
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    
    @property
    def balance(self):
        # Calculate dynamic balance: Opening + (Debits - Credits)
        # Note: For Liability/Equity/Revenue, you might need (Credits - Debits)
        totals = self.ledgers.aggregate(
            debit=Sum('debit'),
            credit=Sum('credit')
        )
        debit = totals['debit'] or Decimal('0.00')
        credit = totals['credit'] or Decimal('0.00')
        
        if self.group in ['Asset', 'Expense']:
            return self.opening_balance + (debit - credit)
        else:
            return self.opening_balance + (credit - debit)

    def __str__(self):
        return f"{self.code} - {self.name} (৳{self.balance})"

class Ledger(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='ledgers')
    date = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255)
    
    # Links to the source transaction
    content_type = models.CharField(max_length=50, null=True, blank=True) # 'Sale', 'Purchase', etc.
    object_id = models.PositiveIntegerField(null=True, blank=True)
    
    debit = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))
    credit = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal('0.00'))

    def __str__(self):
        return f"{self.account.name} | {self.description} | {self.debit}/{self.credit}"