from rest_framework import serializers
from .models import Expense

class ExpenseSerializer(serializers.ModelSerializer):
    employee_recipient_name = serializers.CharField(source='employee_recipient.name', read_only=True)
    entry_by_name = serializers.CharField(source='entry_by.name', read_only=True)

    class Meta:
        model = Expense
        fields = '__all__'