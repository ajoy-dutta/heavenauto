from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from decimal import Decimal

from .models import Account
from .serializers import AccountSerializer


class AccountViewSet(viewsets.ModelViewSet):
    """
    Handles full CRUD actions for the Chart of Accounts.
    React reads from and writes to /api/account/accounts/
    """
    queryset = Account.objects.all().order_by('code')
    serializer_class = AccountSerializer


@api_view(['GET'])
def financial_summary(request):
    """
    Calculates total balances grouped by account type directly from the database.
    Offloads all math from the React frontend dashboard.
    """
    accounts = Account.objects.all()
    
    # Initialize totals tracking keys exactly matching your Account GROUP_CHOICES
    totals = {
        'Asset': Decimal('0.00'),
        'Liability': Decimal('0.00'),
        'Equity': Decimal('0.00'),
        'Revenue': Decimal('0.00'),
        'Expense': Decimal('0.00'),
    }
    
    # Accumulate running ledger calculations using the @property on the model
    for acc in accounts:
        if acc.group in totals:
            totals[acc.group] += acc.balance

    # Calculate Net Profit (Revenue - Expenses)
    net_profit = totals['Revenue'] - totals['Expense']

    # FIX: Corrected totals['Liabilities'] lookup to totals['Liability']
    return Response({
        'revenue': totals['Revenue'],
        'expense': totals['Expense'],
        'net_profit': net_profit,
        'assets': totals['Asset'],
        'liabilities': totals['Liability'],
        'equity': totals['Equity']
    })