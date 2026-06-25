from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from decimal import Decimal

from .models import Account, Ledger
from .serializers import AccountSerializer, LedgerSerializer

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all().order_by('code')
    serializer_class = AccountSerializer

class LedgerViewSet(viewsets.ModelViewSet):
    queryset = Ledger.objects.all().order_by('-date')
    serializer_class = LedgerSerializer
    filterset_fields = ['account', 'content_type', 'object_id']

@api_view(['GET'])
def financial_summary(request):
    accounts = Account.objects.all()
    
    # 1. Initialize master summary including new "Today" metrics
    summary = {
        'revenue': Decimal('0.00'),
        'expense': Decimal('0.00'),
        'assets': Decimal('0.00'),
        'liabilities': Decimal('0.00'),
        'equity': Decimal('0.00'),
        'today_revenue': Decimal('0.00'),
        'today_expense': Decimal('0.00'),
        'today_capital': Decimal('0.00'),
    }

    # 2. Lifetime Balances
    for acc in accounts:
        if acc.group == 'Revenue': summary['revenue'] += acc.balance
        elif acc.group == 'Expense': summary['expense'] += acc.balance
        elif acc.group == 'Asset': summary['assets'] += acc.balance
        elif acc.group == 'Liability': summary['liabilities'] += acc.balance
        elif acc.group == 'Equity': summary['equity'] += acc.balance

    summary['net_profit'] = summary['revenue'] - summary['expense']

    # 3. Calculate "Today's" flow dynamically from the Ledger
    # Get the start of today (Midnight)
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Find all transactions that happened from midnight until right now
    todays_ledgers = Ledger.objects.filter(date__gte=today_start)
    
    for ledger in todays_ledgers:
        if ledger.account.group == 'Revenue':
            # Revenue increases with credits
            summary['today_revenue'] += (ledger.credit - ledger.debit)
        elif ledger.account.group == 'Expense':
            # Expense increases with debits
            summary['today_expense'] += (ledger.debit - ledger.credit)
        elif ledger.account.group == 'Equity':
            # Equity/Capital increases with credits
            summary['today_capital'] += (ledger.credit - ledger.debit)

    return Response(summary)