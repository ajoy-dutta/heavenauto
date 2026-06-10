from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, F
from rest_framework import viewsets, status
from .models import Product, Purchase, Sale
from .serializers import ProductSerializer, PurchaseSerializer, SaleSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer

class SalesSummaryView(APIView):
    def get(self, request):
        # Calculate total revenue from total_price
        total_revenue = Sale.objects.aggregate(total=Sum('total_price'))['total'] or 0
        
        # Calculate total purchase cost
        total_purchase_cost = Purchase.objects.aggregate(total=Sum('total_cost'))['total'] or 0
        
        # Calculate total items sold
        total_items_sold = Sale.objects.aggregate(total=Sum('quantity'))['total'] or 0
        
        # Calculate total items purchased
        total_items_purchased = Purchase.objects.aggregate(total=Sum('quantity'))['total'] or 0
        
        # Calculate total profit
        total_profit = Sale.objects.aggregate(total=Sum('profit'))['total'] or 0
        
        return Response({
            "total_revenue": float(total_revenue),
            "total_purchase_cost": float(total_purchase_cost),
            "total_profit": float(total_profit),
            "total_items_sold": total_items_sold,
            "total_items_purchased": total_items_purchased
        })

class InventorySummaryView(APIView):
    def get(self, request):
        products = Product.objects.all()
        total_stock_value = sum([p.stock_quantity * p.purchase_price for p in products])
        
        return Response({
            "total_products": products.count(),
            "total_stock_value": float(total_stock_value),
            "low_stock_products": [p.name for p in products if p.stock_quantity < 10]
        })