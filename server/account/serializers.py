from rest_framework import serializers
from .models import Account, Ledger

class AccountSerializer(serializers.ModelSerializer):
    # This pulls from the @property in the model
    balance = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = Account
        fields = ['id', 'code', 'name', 'group', 'description', 'opening_balance', 'balance', 'is_active']