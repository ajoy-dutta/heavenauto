from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Ledger, Account
from sale.models import SaleOrder
from purchase.models import PurchaseOrder
from expense.models import Expense

@receiver(post_save, sender=SaleOrder)
def log_sale_to_ledger(sender, instance, created, **kwargs):
    if created:
        cash, _ = Account.objects.get_or_create(code='1000', defaults={'name': 'Cash', 'group': 'Asset'})
        revenue, _ = Account.objects.get_or_create(code='4000', defaults={'name': 'Revenue', 'group': 'Revenue'})
        
        # Debit Cash, Credit Revenue
        Ledger.objects.create(account=cash, content_type='Sale', object_id=instance.id, debit=instance.total_amount)
        Ledger.objects.create(account=revenue, content_type='Sale', object_id=instance.id, credit=instance.total_amount)

@receiver(post_save, sender=PurchaseOrder)
def log_purchase_to_ledger(sender, instance, created, **kwargs):
    if created:
        inventory, _ = Account.objects.get_or_create(code='1030', defaults={'name': 'Inventory', 'group': 'Asset'})
        cash, _ = Account.objects.get_or_create(code='1000', defaults={'name': 'Cash', 'group': 'Asset'})
        
        # Debit Inventory, Credit Cash
        Ledger.objects.create(account=inventory, content_type='Purchase', object_id=instance.id, debit=instance.total_amount)
        Ledger.objects.create(account=cash, content_type='Purchase', object_id=instance.id, credit=instance.total_amount)

@receiver(post_save, sender=Expense)
def log_expense_to_ledger(sender, instance, created, **kwargs):
    if created:
        expense_acc, _ = Account.objects.get_or_create(code='5000', defaults={'name': 'Expenses', 'group': 'Expense'})
        cash, _ = Account.objects.get_or_create(code='1000', defaults={'name': 'Cash', 'group': 'Asset'})
        
        # Debit Expense, Credit Cash
        Ledger.objects.create(account=expense_acc, content_type='Expense', object_id=instance.id, debit=instance.amount)
        Ledger.objects.create(account=cash, content_type='Expense', object_id=instance.id, credit=instance.amount)