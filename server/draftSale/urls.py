from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DraftSaleOrderViewSet

router = DefaultRouter()
router.register(r'draft-sales', DraftSaleOrderViewSet, basename='draft-sale')

urlpatterns = [
    path('', include(router.urls)),
]