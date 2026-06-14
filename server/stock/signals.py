from django.db.models.signals import post_save, post_delete
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

# 2. ADD to stock when a Purchase is saved
@receiver(post_save, sender=Purchase)
def add_stock_on_purchase(sender, instance, created, **kwargs):
    if created:
        stock, _ = Stock.objects.get_or_create(product=instance.product)
        stock.current_quantity += instance.quantity
        stock.save()

# 3. DEDUCT from stock when a Sale is saved
@receiver(post_save, sender=Sale)
def deduct_stock_on_sale(sender, instance, created, **kwargs):
    if created:
        stock, _ = Stock.objects.get_or_create(product=instance.product)
        stock.current_quantity -= instance.quantity
        stock.save()

# 4. (Optional Safety) Restore stock if a Sale is cancelled/deleted
@receiver(post_delete, sender=Sale)
def restore_stock_on_sale_delete(sender, instance, **kwargs):
    try:
        stock = Stock.objects.get(product=instance.product)
        stock.current_quantity += instance.quantity
        stock.save()
    except Stock.DoesNotExist:
        pass