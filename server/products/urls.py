from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, BulkProductImportView

router = DefaultRouter()
# Registering at r'' removes the double "products/products/" duplication
router.register(r'', ProductViewSet, basename='product')

urlpatterns = [
    # Bulk import MUST go before the router urls so Django doesn't think 'bulk-import' is a product ID
    path('bulk-import/', BulkProductImportView.as_view(), name='bulk-product-import'),
    path('', include(router.urls)),
]