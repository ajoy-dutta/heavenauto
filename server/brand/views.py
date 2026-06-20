from rest_framework import viewsets
from .models import Brand
from .serializers import BrandSerializer

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all().order_by('name')
    serializer_class = BrandSerializer