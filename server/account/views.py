from rest_framework import viewsets
from .models import Account, JournalEntry
from .serializers import AccountSerializer, JournalEntrySerializer

class AccountViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Accounts to be viewed or edited.
    You can use this to add new Accounts to your Chart of Accounts.
    """
    queryset = Account.objects.all().order_by('code')
    serializer_class = AccountSerializer

class JournalEntryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint to view Journal Entries.
    This is strictly READ-ONLY to preserve accounting integrity.
    Entries are automatically created via Signals from Purchases & Sales.
    """
    queryset = JournalEntry.objects.all().order_by('-date')
    serializer_class = JournalEntrySerializer