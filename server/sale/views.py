from rest_framework import viewsets
from .models import SaleOrder
from .serializers import SaleOrderSerializer

class SaleOrderViewSet(viewsets.ModelViewSet):
    queryset = SaleOrder.objects.all().order_by('-sale_date')
    serializer_class = SaleOrderSerializer