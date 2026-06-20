from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SaleOrderViewSet

router = DefaultRouter()
router.register(r'sales', SaleOrderViewSet, basename='sale')

urlpatterns = [
    path('', include(router.urls)),
]