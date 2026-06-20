from django.db import models

class Supplier(models.Model):
    name = models.CharField(max_length=255, unique=True, help_text="Supplier Company or Vendor Name")
    contact_person = models.CharField(max_length=150, blank=True, null=True, help_text="Name of the person you deal with")
    
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    is_active = models.BooleanField(default=True, help_text="Uncheck to hide this supplier from dropdowns")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name