# server/person/serializers.py
from rest_framework import serializers
from .models import Employee, Education, PreviousWork, Customer

# ==========================================
# 1. EMPLOYEE SERIALIZERS (Nested)
# ==========================================
class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        # Hide the employee ID inside the sub-data to keep the JSON clean
        exclude = ['employee']

class PreviousWorkSerializer(serializers.ModelSerializer):
    class Meta:
        model = PreviousWork
        exclude = ['employee']

class EmployeeSerializer(serializers.ModelSerializer):
    # These bundle the education and work history automatically
    education = EducationSerializer(many=True, read_only=True)
    previous_work = PreviousWorkSerializer(many=True, read_only=True)

    class Meta:
        model = Employee
        fields = '__all__'


# ==========================================
# 2. CUSTOMER SERIALIZER
# ==========================================
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        # Grabs every field, including the moto-specific ones like vehicle_model
        fields = '__all__'