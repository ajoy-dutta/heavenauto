from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from person.models import Customer, Employee

class Product(models.Model):
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    purchase_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.name} - {self.brand}"

class Purchase(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    total_cost = models.DecimalField(max_digits=12, decimal_places=2)
    purchased_at = models.DateTimeField(auto_now_add=True)
    purchased_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True)

    def save(self, *args, **kwargs):
        # Calculate total cost before saving
        if not self.total_cost:
            self.total_cost = self.product.purchase_price * self.quantity
        super(Purchase, self).save(*args, **kwargs)

    def __str__(self):
        return f"Purchase: {self.product.name} ({self.quantity})"

class Sale(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    
    # --- PRICING & PROFIT TRACKING ---
    unit_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        blank=True, 
        null=True,
        help_text="Leave blank to use standard sale price, or enter a negotiated price."
    )
    total_price = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    profit = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    
    sold_at = models.DateTimeField(auto_now_add=True)
    sold_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True)

    def save(self, *args, **kwargs):
        # 1. Auto-fill the unit price with the default sale_price if left blank
        if not self.unit_price:
            self.unit_price = self.product.sale_price

        # 2. Automatically calculate the total revenue
        self.total_price = self.unit_price * self.quantity

        # 3. Automatically calculate exact profit for this sale
        self.profit = (self.unit_price - self.product.purchase_price) * self.quantity

        super(Sale, self).save(*args, **kwargs)

    def __str__(self):
        return f"Sale: {self.product.name} to {self.customer.proprietor_name}"

# ==========================================
# AUTOMATIC STOCK MANAGEMENT SIGNALS
# ==========================================

@receiver(post_save, sender=Purchase)
def update_stock_on_purchase(sender, instance, created, **kwargs):
    if created:
        instance.product.stock_quantity += instance.quantity
        instance.product.save()

@receiver(post_save, sender=Sale)
def update_stock_on_sale(sender, instance, created, **kwargs):
    if created:
        instance.product.stock_quantity -= instance.quantity
        instance.product.save()

@receiver(post_delete, sender=Purchase)
def revert_stock_on_purchase_delete(sender, instance, **kwargs):
    instance.product.stock_quantity -= instance.quantity
    instance.product.save()

@receiver(post_delete, sender=Sale)
def revert_stock_on_sale_delete(sender, instance, **kwargs):
    instance.product.stock_quantity += instance.quantity
    instance.product.save()