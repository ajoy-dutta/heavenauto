from rest_framework import serializers
from .models import Account, JournalEntry, JournalItem

class AccountSerializer(serializers.ModelSerializer):
    # This automatically fetches the dynamically calculated balance from your model
    balance = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = Account
        fields = ['id', 'code', 'name', 'group', 'description', 'is_active', 'balance']

class JournalItemSerializer(serializers.ModelSerializer):
    # Fetch the actual name and code of the account, not just the ID number
    account_name = serializers.CharField(source='account.name', read_only=True)
    account_code = serializers.CharField(source='account.code', read_only=True)

    class Meta:
        model = JournalItem
        fields = ['id', 'account', 'account_name', 'account_code', 'debit', 'credit']

class JournalEntrySerializer(serializers.ModelSerializer):
    # Nest the items inside the journal entry so React gets the full picture at once
    items = JournalItemSerializer(many=True, read_only=True)
    date = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = JournalEntry
        fields = ['id', 'date', 'description', 'purchase', 'sale', 'items']