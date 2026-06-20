from rest_framework import serializers
from .models import Stock

class StockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    brand = serializers.CharField(source='product.brand', read_only=True)
    part_number = serializers.CharField(source='product.part_number', read_only=True)

    class Meta:
        model = Stock
        fields = '__all__'