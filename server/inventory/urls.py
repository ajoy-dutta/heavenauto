# server/inventory/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet,
    PurchaseViewSet,
    SaleViewSet,
    SalesSummaryView,
    InventorySummaryView,
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'purchases', PurchaseViewSet)
router.register(r'sales', SaleViewSet)

urlpatterns = [
    # ViewSet routes
    path('api/', include(router.urls)),

    # Custom API endpoints
    path(
        'api/sales-summary/',
        SalesSummaryView.as_view(),
        name='sales-summary'
    ),
    path(
        'api/inventory-summary/',
        InventorySummaryView.as_view(),
        name='inventory-summary'
    ),
]