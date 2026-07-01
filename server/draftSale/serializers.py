from rest_framework import serializers
from .models import DraftSaleOrder, DraftSaleItem

class DraftSaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.product_name', read_only=True)
    part_number = serializers.CharField(source='product.part_number', read_only=True)

    class Meta:
        model = DraftSaleItem
        fields = ['id', 'product', 'product_name', 'part_number', 'quantity', 'unit_price_bdt', 'total_price_bdt', 'profit_bdt']
        read_only_fields = ['total_price_bdt', 'profit_bdt']

class DraftSaleOrderSerializer(serializers.ModelSerializer):
    items = DraftSaleItemSerializer(many=True)
    sold_by_name = serializers.CharField(source='sold_by.name', read_only=True)
    customer_name = serializers.CharField(source='customer.proprietor_name', read_only=True)

    class Meta:
        model = DraftSaleOrder
        fields = '__all__'
        read_only_fields = ['invoice_number', 'total_amount', 'payment_status']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        total_amount = sum(float(item['unit_price_bdt']) * item['quantity'] for item in items_data)
        validated_data['total_amount'] = total_amount
        draft_order = DraftSaleOrder.objects.create(**validated_data)
        for item_data in items_data:
            DraftSaleItem.objects.create(draft_order=draft_order, **item_data)
        return draft_order

    def update(self, instance, validated_data):
        # Remove items from validated_data – handle them manually
        items_data = validated_data.pop('items', [])

        # Update the draft order fields (except read-only ones)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        # Recalculate total_amount from the incoming items
        total_amount = sum(float(item['unit_price_bdt']) * item['quantity'] for item in items_data)
        instance.total_amount = total_amount
        instance.save()

        # Get existing item IDs
        existing_item_ids = list(instance.items.values_list('id', flat=True))
        new_item_ids = []

        for item_data in items_data:
            item_id = item_data.get('id', None)
            if item_id:
                # Update existing item
                try:
                    item = DraftSaleItem.objects.get(id=item_id, draft_order=instance)
                    # Update fields except 'id' and read-only ones (total_price_bdt, profit_bdt)
                    for attr, value in item_data.items():
                        if attr not in ['id', 'total_price_bdt', 'profit_bdt']:
                            setattr(item, attr, value)
                    item.save()
                    new_item_ids.append(item.id)
                except DraftSaleItem.DoesNotExist:
                    # If ID provided but not found, treat as a new item (fallback)
                    item = DraftSaleItem.objects.create(draft_order=instance, **item_data)
                    new_item_ids.append(item.id)
            else:
                # Create new item
                item = DraftSaleItem.objects.create(draft_order=instance, **item_data)
                new_item_ids.append(item.id)

        # Delete items that are no longer present
        for item_id in existing_item_ids:
            if item_id not in new_item_ids:
                DraftSaleItem.objects.filter(id=item_id).delete()

        # Recalculate total_amount after modifications (already done above)
        # instance.total_amount = sum(item.total_price_bdt for item in instance.items.all())
        # instance.save()

        return instance