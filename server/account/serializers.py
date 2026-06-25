from rest_framework import serializers
from .models import Account, Ledger

class LedgerSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    account_code = serializers.CharField(source='account.code', read_only=True)

    class Meta:
        model = Ledger
        fields = '__all__'

class AccountSerializer(serializers.ModelSerializer):
    # Expose the dynamic @property to the React frontend
    balance = serializers.DecimalField(max_digits=15, decimal_places=2, read_only=True)

    class Meta:
        model = Account
        # Removed 'opening_balance' and added 'balance'
        fields = ['id', 'code', 'name', 'group', 'balance']