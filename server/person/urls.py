from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, CustomerViewSet

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'customers', CustomerViewSet)

urlpatterns = [
    # Remove the 'api/' here and leave it as an empty string ''
    path('', include(router.urls)),
]