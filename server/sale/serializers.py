from rest_framework import serializers
from .models import Sale

class SaleSerializer(serializers.ModelSerializer):
    # Fetching readable names for the frontend tables
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    customer_name = serializers.CharField(source='customer.shop_name', default="Retail Customer", read_only=True)
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)

    class Meta:
        model = Sale
        fields = '__all__'