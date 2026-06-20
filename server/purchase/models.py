import uuid
from django.db import models
from products.models import Product
from person.models import Employee
from supplier.models import Supplier

class PurchaseOrder(models.Model):
    # Master Record
    po_number = models.CharField(max_length=20, unique=True, editable=False)
    entry_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='purchases_logged')
    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='purchase_orders', null=True, blank=True) 
    
    purchase_date = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True, null=True)

    # --- Simplified Financials ---
    # The sum of all items. Discounts and payments will be handled in the Payment App.
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0.00, editable=False)
    
    # Just a status flag. The Payment App will change this to 'Partial' or 'Paid' later.
    payment_status = models.CharField(max_length=50, default="Unpaid")

    def save(self, *args, **kwargs):
        if not self.po_number:
            self.po_number = f"PO-{uuid.uuid4().hex[:6].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.po_number} - {self.supplier.name if self.supplier else 'Unknown'}"


class PurchaseItem(models.Model):
    # Detail Record
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT) 
    
    quantity = models.PositiveIntegerField()
    unit_cost_bdt = models.DecimalField(max_digits=12, decimal_places=2)
    total_cost_bdt = models.DecimalField(max_digits=14, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        self.total_cost_bdt = float(self.unit_cost_bdt) * float(self.quantity)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity}x {self.product.product_name}"