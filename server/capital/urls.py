from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CapitalViewSet, CapitalCategoryViewSet

router = DefaultRouter()
router.register(r'categories', CapitalCategoryViewSet, basename='capital-category')
router.register(r'entries', CapitalViewSet, basename='capital')

urlpatterns = [
    path('', include(router.urls)),
]