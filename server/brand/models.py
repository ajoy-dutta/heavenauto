from django.db import models

class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True, help_text="Company Name (e.g., Yamaha, Suzuki)")
    description = models.TextField(blank=True, null=True, help_text="Optional description or notes about the brand")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name