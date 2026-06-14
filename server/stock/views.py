from rest_framework import viewsets
from .models import Stock
from .serializers import StockSerializer

class StockViewSet(viewsets.ReadOnlyModelViewSet):
    # Notice we use ReadOnlyModelViewSet so no one can POST directly to stock
    queryset = Stock.objects.all().order_by('product__product_name')
    serializer_class = StockSerializer