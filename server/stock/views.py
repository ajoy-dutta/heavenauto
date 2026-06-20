from rest_framework import viewsets
from .models import Stock
from .serializers import StockSerializer

# Use ReadOnlyModelViewSet so React can ONLY GET stock data, not POST/PUT
class StockViewSet(viewsets.ReadOnlyModelViewSet): 
    queryset = Stock.objects.all().order_by('product__product_name')
    serializer_class = StockSerializer