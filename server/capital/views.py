from rest_framework import viewsets
from .models import Capital, CapitalCategory
from .serializers import CapitalSerializer, CapitalCategorySerializer

class CapitalCategoryViewSet(viewsets.ModelViewSet):
    queryset = CapitalCategory.objects.all().order_by('name')
    serializer_class = CapitalCategorySerializer

class CapitalViewSet(viewsets.ModelViewSet):
    queryset = Capital.objects.all().order_by('-transaction_date', '-created_at')
    serializer_class = CapitalSerializer