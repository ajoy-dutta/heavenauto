from rest_framework import serializers
from .models import Stock

class StockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    part_number = serializers.CharField(source='product.part_number', read_only=True)
    category = serializers.CharField(source='product.category', read_only=True)
    min_stock_level = serializers.IntegerField(source='product.min_stock_level', read_only=True)

    class Meta:
        model = Stock
        fields = '__all__'