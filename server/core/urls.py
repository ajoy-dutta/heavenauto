# server/core/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # This connects the person API to the main project
    path('', include('person.urls')), 
    path('', include('inventory.urls')),
]