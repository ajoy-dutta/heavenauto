from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver
from products.models import Product
from purchase.models import PurchaseItem
from sale.models import SaleItem
from .models import Stock

# 1. Create 0 stock when a brand new product is added to the catalog
@receiver(post_save, sender=Product)
def initialize_stock(sender, instance, created, **kwargs):
    if created:
        Stock.objects.create(product=instance, current_quantity=0)

# 2. Add to stock when a PurchaseItem is saved
@receiver(pre_save, sender=PurchaseItem)
def capture_old_purchase_qty(sender, instance, **kwargs):
    if instance.pk:
        instance._old_quantity = PurchaseItem.objects.get(pk=instance.pk).quantity
    else:
        instance._old_quantity = 0

@receiver(post_save, sender=PurchaseItem)
def add_to_stock(sender, instance, created, **kwargs):
    stock, _ = Stock.objects.get_or_create(product=instance.product)
    if created:
        stock.current_quantity += instance.quantity
    else:
        difference = instance.quantity - getattr(instance, '_old_quantity', 0)
        stock.current_quantity += difference
    stock.save()

@receiver(post_delete, sender=PurchaseItem)
def revert_stock_on_purchase_delete(sender, instance, **kwargs):
    try:
        stock = Stock.objects.get(product=instance.product)
        stock.current_quantity -= instance.quantity
        stock.save()
    except Stock.DoesNotExist:
        pass

# 3. Deduct from stock when a SaleItem is saved
@receiver(pre_save, sender=SaleItem)
def capture_old_sale_qty(sender, instance, **kwargs):
    if instance.pk:
        instance._old_quantity = SaleItem.objects.get(pk=instance.pk).quantity
    else:
        instance._old_quantity = 0

@receiver(post_save, sender=SaleItem)
def deduct_from_stock(sender, instance, created, **kwargs):
    stock, _ = Stock.objects.get_or_create(product=instance.product)
    if created:
        stock.current_quantity -= instance.quantity
    else:
        difference = instance.quantity - getattr(instance, '_old_quantity', 0)
        stock.current_quantity -= difference
    stock.save()

@receiver(post_delete, sender=SaleItem)
def revert_stock_on_sale_delete(sender, instance, **kwargs):
    try:
        stock = Stock.objects.get(product=instance.product)
        stock.current_quantity += instance.quantity
        stock.save()
    except Stock.DoesNotExist:
        pass