from django.db.models.signals import post_save
from django.dispatch import receiver
from purchase.models import Purchase
from sale.models import Sale
from .models import Account, JournalEntry, JournalItem

@receiver(post_save, sender=Purchase)
def automate_purchase_ledger(sender, instance, created, **kwargs):
    if created:
        # Create a new Journal Entry for the Purchase
        je = JournalEntry.objects.create(
            description=f"Wholesale Purchase - ID: {instance.purchase_id}",
            purchase=instance
        )
        
        # 1. DEBIT Inventory (Account 1030) -> Your stock value goes UP
        inventory_acc = Account.objects.get(code='1030')
        JournalItem.objects.create(journal_entry=je, account=inventory_acc, debit=instance.total_cost_bdt)
        
        # 2. CREDIT Cash (Account 1000) -> Your cash balance goes DOWN
        cash_acc = Account.objects.get(code='1000')
        JournalItem.objects.create(journal_entry=je, account=cash_acc, credit=instance.total_cost_bdt)


@receiver(post_save, sender=Sale)
def automate_sale_ledger(sender, instance, created, **kwargs):
    if created:
        # Create a new Journal Entry for the Sale
        je = JournalEntry.objects.create(
            description=f"Customer Sale - ID: {instance.id}",
            sale=instance
        )
        
        # 1. DEBIT Cash (Account 1000) -> Your cash balance goes UP
        cash_acc = Account.objects.get(code='1000')
        # ✅ FIXED: Changed instance.total_price to instance.total_price_bdt
        JournalItem.objects.create(journal_entry=je, account=cash_acc, debit=instance.total_price_bdt)
        
        # 2. CREDIT Sales Revenue (Account 4000) -> Your revenue goes UP
        revenue_acc = Account.objects.get(code='4000')
        # ✅ FIXED: Changed instance.total_price to instance.total_price_bdt
        JournalItem.objects.create(journal_entry=je, account=revenue_acc, credit=instance.total_price_bdt)