from rest_framework import serializers
from .models import Purchase

class PurchaseSerializer(serializers.ModelSerializer):
    # Fetching related readable names so React doesn't just show an ID number
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    product_part_number = serializers.CharField(source='product.part_number', read_only=True)
    entry_by_name = serializers.CharField(source='entry_by.full_name', read_only=True)

    class Meta:
        model = Purchase
        fields = '__all__'