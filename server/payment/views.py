from rest_framework import viewsets
from .models import Payment
from .serializers import PaymentSerializer

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-payment_date')
    serializer_class = PaymentSerializer

    def get_queryset(self):
        """Allow filtering payments by sale ID, purchase ID, or type."""
        queryset = super().get_queryset()
        sale_id = self.request.query_params.get('sale')
        purchase_id = self.request.query_params.get('purchase')
        payment_type = self.request.query_params.get('payment_type')

        if sale_id:
            queryset = queryset.filter(sale_id=sale_id)
        if purchase_id:
            queryset = queryset.filter(purchase_id=purchase_id)
        if payment_type:
            queryset = queryset.filter(payment_type=payment_type)
            
        return queryset