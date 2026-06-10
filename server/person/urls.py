# server/person/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, CustomerViewSet

# The router automatically generates all the standard API URLs for us
router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'customers', CustomerViewSet)

urlpatterns = [
    # This exposes your API at /api/...
    path('api/', include(router.urls)),
]