from rest_framework import serializers
from .models import SaleOrder, SaleItem
from stock.models import Stock # <-- Import Stock to check availability

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    part_number = serializers.CharField(source='product.part_number', read_only=True)

    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'part_number', 'quantity', 'unit_price_bdt', 'total_price_bdt', 'profit_bdt']
        read_only_fields = ['total_price_bdt', 'profit_bdt']

class SaleOrderSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    sold_by_name = serializers.CharField(source='sold_by.name', read_only=True)
    customer_name = serializers.CharField(source='customer.proprietor_name', read_only=True)

    class Meta:
        model = SaleOrder
        fields = '__all__'
        read_only_fields = ['invoice_number', 'total_amount', 'payment_status']

    def validate(self, data):
        """
        SECURITY CHECK: Prevent selling products if there is not enough stock.
        """
        items = data.get('items', [])
        for item in items:
            product = item['product']
            requested_qty = item['quantity']

            try:
                stock = Stock.objects.get(product=product)
                if stock.current_quantity < requested_qty:
                    raise serializers.ValidationError(
                        f"Not enough stock for {product.product_name}. Available: {stock.current_quantity}, Requested: {requested_qty}."
                    )
            except Stock.DoesNotExist:
                raise serializers.ValidationError(
                    f"No stock record found for {product.product_name}. You must purchase it first."
                )

        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Auto-sum the grand total based on the items sent from React
        total_amount = sum(float(item['unit_price_bdt']) * item['quantity'] for item in items_data)
        validated_data['total_amount'] = total_amount

        sale_order = SaleOrder.objects.create(**validated_data)
        
        for item_data in items_data:
            SaleItem.objects.create(sale_order=sale_order, **item_data)
            
        return sale_order