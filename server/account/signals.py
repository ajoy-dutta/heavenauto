from django.db.models.signals import post_save
from django.dispatch import receiver
from decimal import Decimal
from capital.models import Capital
from expense.models import Expense
from payment.models import Payment
from .models import Account, Ledger

def get_account(code, name, group):
    account, _ = Account.objects.get_or_create(
        code=code, 
        defaults={'name': name, 'group': group}
    )
    return account

@receiver(post_save, sender=Capital)
def create_capital_ledger(sender, instance, created, **kwargs):
    if created:
        cash = get_account('1000', 'Cash & Bank Equivalents', 'Asset')
        equity = get_account('3000', 'Owner Equity / Capital', 'Equity')
        desc = f"Capital: {instance.source_name}"
        Ledger.objects.create(account=cash, description=desc, content_type='Capital', object_id=instance.capital_id, debit=instance.amount)
        Ledger.objects.create(account=equity, description=desc, content_type='Capital', object_id=instance.capital_id, credit=instance.amount)

@receiver(post_save, sender=Expense)
def create_expense_ledger(sender, instance, created, **kwargs):
    if created:
        exp_acc = get_account('5000', 'Operating Expenses', 'Expense')
        cash = get_account('1000', 'Cash & Bank Equivalents', 'Asset')
        desc = f"Expense: {instance.main_category} - {instance.sub_category}"
        Ledger.objects.create(account=exp_acc, description=desc, content_type='Expense', object_id=instance.expense_id, debit=instance.amount)
        Ledger.objects.create(account=cash, description=desc, content_type='Expense', object_id=instance.expense_id, credit=instance.amount)

@receiver(post_save, sender=Payment)
def create_payment_ledger(sender, instance, created, **kwargs):
    if created:
        cash = get_account('1000', 'Cash & Bank Equivalents', 'Asset')
        
        if instance.payment_type == 'IN':  # Sale Payment
            rev = get_account('4000', 'Sales Revenue', 'Revenue')
            # Use getattr to safely get ID/Number without crashing
            order_ref = getattr(instance.sale, 'sale_id', getattr(instance.sale, 'id', 'Unknown'))
            desc = f"Payment Recv: Sale #{order_ref}"
            Ledger.objects.create(account=cash, description=desc, content_type='Payment-IN', object_id=instance.payment_id, debit=instance.amount)
            Ledger.objects.create(account=rev, description=desc, content_type='Payment-IN', object_id=instance.payment_id, credit=instance.amount)
            
        elif instance.payment_type == 'OUT':  # Purchase Payment
            inv = get_account('1020', 'Inventory / Purchases', 'Asset')
            order_ref = getattr(instance.purchase, 'po_number', getattr(instance.purchase, 'id', 'Unknown'))
            desc = f"Payment Paid: Purchase #{order_ref}"
            Ledger.objects.create(account=inv, description=desc, content_type='Payment-OUT', object_id=instance.payment_id, debit=instance.amount)
            Ledger.objects.create(account=cash, description=desc, content_type='Payment-OUT', object_id=instance.payment_id, credit=instance.amount)