from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AccountViewSet, LedgerViewSet, financial_summary

router = DefaultRouter()
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'ledgers', LedgerViewSet, basename='ledger')

urlpatterns = [
    # IMPORTANT: Put 'summary/' before the router so it gets matched correctly!
    path('summary/', financial_summary, name='financial-summary'),
    
    # Standard ViewSet routes
    path('', include(router.urls)),
]