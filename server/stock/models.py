from django.db import models
from products.models import Product

class Stock(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='inventory_stock')
    current_quantity = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.product_name}: {self.current_quantity} in stock"