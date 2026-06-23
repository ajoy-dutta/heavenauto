from rest_framework import serializers
from .models import Capital, CapitalCategory

class CapitalCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = CapitalCategory
        fields = '__all__'

class CapitalSerializer(serializers.ModelSerializer):
    # This ensures when you GET the data, it shows the category name, not just an ID number
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Capital
        fields = '__all__'