from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    handled_by_name = serializers.StringRelatedField(source='handled_by', read_only=True)
    sale_invoice = serializers.CharField(source='sale.invoice_number', read_only=True)
    purchase_po = serializers.CharField(source='purchase.po_number', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'