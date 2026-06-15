from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from products.models import Product
from purchase.models import Purchase
from sale.models import Sale
from .models import Stock

# 1. Initialize Stock to 0 when a new Product is created
@receiver(post_save, sender=Product)
def create_stock_for_new_product(sender, instance, created, **kwargs):
    if created:
        Stock.objects.create(product=instance, current_quantity=0)

# ==========================================
# PURCHASE SIGNALS (Add to Stock)
# ==========================================

# Capture the OLD quantity before the Purchase is saved
@receiver(pre_save, sender=Purchase)
def capture_old_purchase_quantity(sender, instance, **kwargs):
    if instance.pk: # If this is an update to an existing purchase
        try:
            instance._old_quantity = Purchase.objects.get(pk=instance.pk).quantity
        except Purchase.DoesNotExist:
            instance._old_quantity = 0
    else: # If this is a brand new purchase
        instance._old_quantity = 0

# Apply the mathematical difference to the Stock
@receiver(post_save, sender=Purchase)
def update_stock_on_purchase(sender, instance, created, **kwargs):
    stock, _ = Stock.objects.get_or_create(product=instance.product)
    
    if created:
        # It's a new purchase, just add the whole quantity
        stock.current_quantity += instance.quantity
    else:
        # It's an edit, calculate how much the quantity changed
        difference = instance.quantity - getattr(instance, '_old_quantity', 0)
        stock.current_quantity += difference
        
    stock.save()

# Restore stock (deduct) if a Purchase is deleted
@receiver(post_delete, sender=Purchase)
def remove_stock_on_purchase_delete(sender, instance, **kwargs):
    try:
        stock = Stock.objects.get(product=instance.product)
        stock.current_quantity -= instance.quantity
        stock.save()
    except Stock.DoesNotExist:
        pass


# ==========================================
# SALE SIGNALS (Deduct from Stock)
# ==========================================

# Capture the OLD quantity before the Sale is saved
@receiver(pre_save, sender=Sale)
def capture_old_sale_quantity(sender, instance, **kwargs):
    if instance.pk:
        try:
            instance._old_quantity = Sale.objects.get(pk=instance.pk).quantity
        except Sale.DoesNotExist:
            instance._old_quantity = 0
    else:
        instance._old_quantity = 0

# Apply the mathematical difference to the Stock
@receiver(post_save, sender=Sale)
def update_stock_on_sale(sender, instance, created, **kwargs):
    stock, _ = Stock.objects.get_or_create(product=instance.product)
    
    if created:
        # It's a new sale, deduct the whole quantity
        stock.current_quantity -= instance.quantity
    else:
        # It's an edit, calculate how much the quantity changed
        difference = instance.quantity - getattr(instance, '_old_quantity', 0)
        stock.current_quantity -= difference # Subtract the difference
        
    stock.save()

# Restore stock (add back) if a Sale is cancelled/deleted
@receiver(post_delete, sender=Sale)
def restore_stock_on_sale_delete(sender, instance, **kwargs):
    try:
        stock = Stock.objects.get(product=instance.product)
        stock.current_quantity += instance.quantity
        stock.save()
    except Stock.DoesNotExist:
        pass