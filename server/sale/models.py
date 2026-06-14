import uuid
from django.db import models
from products.models import Product
from person.models import Customer, Employee

class Sale(models.Model):
    sale_id = models.CharField(max_length=20, unique=True, editable=False)
    
    # --- Relational Links ---
    product = models.ForeignKey(Product, on_delete=models.RESTRICT, related_name='sales_history')
    customer = models.ForeignKey(Customer, on_delete=models.RESTRICT, related_name='purchased_items', help_text="Bought by (Customer)")
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='sales_handled', help_text="Sold by (Employee)")
    
    # --- Sale Details ---
    quantity = models.PositiveIntegerField()
    unit_price_bdt = models.DecimalField(max_digits=12, decimal_places=2, blank=True, help_text="Selling price per unit (Leave blank to use default Product Retail Price)")
    discount_bdt = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, help_text="Total discount given on this sale item")
    total_price_bdt = models.DecimalField(max_digits=14, decimal_places=2, editable=False)
    
    invoice_number = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    sale_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # 1. Auto-generate ID
        if not self.sale_id:
            self.sale_id = f"SAL-{uuid.uuid4().hex[:6].upper()}"
        
        # 2. Auto-fetch default price from Product if staff left it blank
        if not self.unit_price_bdt:
            self.unit_price_bdt = self.product.retail_price_bdt
            
        # 3. Calculate Final Total: (Unit Price * Qty) - Discount
        self.total_price_bdt = (self.unit_price_bdt * self.quantity) - self.discount_bdt
            
        super(Sale, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.sale_id} - {self.product.product_name} ({self.quantity} pcs)"