from django.db import models
from products.models import Product

class Stock(models.Model):
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='stock_record')
    current_quantity = models.IntegerField(default=0, help_text="Current available stock in warehouse")
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Stock: {self.product.product_name} - {self.current_quantity} pcs"