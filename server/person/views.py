# server/person/views.py
from rest_framework import viewsets
from .models import Employee, Customer
from .serializers import EmployeeSerializer, CustomerSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    # This grabs all employees from the database
    queryset = Employee.objects.all()
    # This tells the view to use the translator we built earlier
    serializer_class = EmployeeSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    # This grabs all customers
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer