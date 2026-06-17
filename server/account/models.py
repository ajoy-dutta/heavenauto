from django.db import models
from purchase.models import Purchase
# CORRECT
from sale.models import Sale # Assuming Sale is in your inventory app

class AccountGroup(models.TextChoices):
    ASSET = 'Asset', 'Asset'
    LIABILITY = 'Liability', 'Liability'
    EQUITY = 'Equity', 'Equity'
    REVENUE = 'Revenue', 'Revenue'
    EXPENSE = 'Expense', 'Expense'

class Account(models.Model):
    """The Chart of Accounts (COA)"""
    code = models.CharField(max_length=10, unique=True, help_text="e.g., 1000, 1010")
    name = models.CharField(max_length=255, help_text="e.g., Cash, Accounts Receivable")
    group = models.CharField(max_length=20, choices=AccountGroup.choices)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} - {self.name} ({self.group})"

    @property
    def balance(self):
        """
        Dynamically calculates the current balance.
        Assets & Expenses increase with Debits.
        Liabilities, Equity, & Revenue increase with Credits.
        """
        debits = sum(item.debit for item in self.journal_items.all())
        credits = sum(item.credit for item in self.journal_items.all())
        
        if self.group in [AccountGroup.ASSET, AccountGroup.EXPENSE]:
            return debits - credits
        else:
            return credits - debits


class JournalEntry(models.Model):
    """The main record of a financial event"""
    date = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255)
    
    # Dynamic links to your other apps!
    purchase = models.ForeignKey(Purchase, on_delete=models.SET_NULL, null=True, blank=True, related_name='journal_entries')
    sale = models.ForeignKey(Sale, on_delete=models.SET_NULL, null=True, blank=True, related_name='journal_entries')

    def __str__(self):
        return f"Entry {self.id} - {self.date.strftime('%Y-%m-%d')}"


class JournalItem(models.Model):
    """The Debit or Credit line inside a Journal Entry"""
    journal_entry = models.ForeignKey(JournalEntry, on_delete=models.CASCADE, related_name='items')
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='journal_items')
    debit = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)
    credit = models.DecimalField(max_digits=14, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.account.name} | Dr: {self.debit} | Cr: {self.credit}"