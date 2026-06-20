from rest_framework import serializers
from .models import PurchaseOrder, PurchaseItem

class PurchaseItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)

    class Meta:
        model = PurchaseItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_cost_bdt', 'total_cost_bdt']
        read_only_fields = ['total_cost_bdt']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True)
    entry_by_name = serializers.CharField(source='entry_by.name', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = '__all__'
        # Lock these fields so the frontend cannot manually override the math
        read_only_fields = ['po_number', 'total_amount', 'payment_status']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # 1. Calculate the exact grand total from the incoming items
        total_amount = sum(float(item['unit_cost_bdt']) * item['quantity'] for item in items_data)
        validated_data['total_amount'] = total_amount
        
        # 2. Create Master Order
        purchase_order = PurchaseOrder.objects.create(**validated_data)
        
        # 3. Create Items
        for item_data in items_data:
            PurchaseItem.objects.create(purchase_order=purchase_order, **item_data)
            
        return purchase_order