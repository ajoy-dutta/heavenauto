from rest_framework import viewsets
from .models import Supplier
from .serializers import SupplierSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    # FIX: Changed 'order_id' to 'order_by'
    queryset = Supplier.objects.all().order_by('-id') 
    serializer_class = SupplierSerializer