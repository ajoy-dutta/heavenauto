from rest_framework import viewsets
from .models import DraftSaleOrder
from .serializers import DraftSaleOrderSerializer

class DraftSaleOrderViewSet(viewsets.ModelViewSet):
    queryset = DraftSaleOrder.objects.all().order_by('-sale_date')
    serializer_class = DraftSaleOrderSerializer