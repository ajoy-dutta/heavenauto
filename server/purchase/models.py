import uuid
from django.db import models
from products.models import Product
from person.models import Employee

class Purchase(models.Model):
    purchase_id = models.CharField(max_length=20, unique=True, editable=False)
    
    # Relational Links
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='purchase_history')
    entry_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Purchase Details
    quantity = models.PositiveIntegerField()
    unit_cost_bdt = models.DecimalField(max_digits=12, decimal_places=2)
    total_cost_bdt = models.DecimalField(max_digits=14, decimal_places=2, editable=False)
    
    supplier_name = models.CharField(max_length=255, blank=True, null=True)
    invoice_number = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True) # Ensure you ran migrations after adding this!
    purchase_date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Auto-generate ID
        if not self.purchase_id:
            self.purchase_id = f"PUR-{uuid.uuid4().hex[:6].upper()}"
        
        # Auto-calculate total cost
        self.total_cost_bdt = self.unit_cost_bdt * self.quantity
            
        super(Purchase, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.purchase_id} - {self.product.product_name}"