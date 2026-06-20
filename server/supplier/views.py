from rest_framework import viewsets
from .models import Supplier
from .serializers import SupplierSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    # Only fetch active suppliers for standard dropdowns, order alphabetically
    queryset = Supplier.objects.filter(is_active=True).order_by('name')
    serializer_class = SupplierSerializer