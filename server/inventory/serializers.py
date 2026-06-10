from rest_framework import serializers
from .models import Product, Purchase, Sale

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class PurchaseSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    
    class Meta:
        model = Purchase
        fields = '__all__'
        read_only_fields = ('total_cost',)

    def create(self, validated_data):
        # Auto-calculate total_cost
        product = validated_data.get('product')
        quantity = validated_data.get('quantity')
        validated_data['total_cost'] = product.purchase_price * quantity
        return super().create(validated_data)

class SaleSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    customer_name = serializers.ReadOnlyField(source='customer.proprietor_name')
    
    class Meta:
        model = Sale
        fields = '__all__'
        read_only_fields = ('total_price', 'profit')

    def validate(self, data):
        # Check stock availability
        product = data.get('product')
        quantity = data.get('quantity')
        
        if quantity > product.stock_quantity:
            raise serializers.ValidationError(
                f"Insufficient stock! Available: {product.stock_quantity}"
            )
        return data