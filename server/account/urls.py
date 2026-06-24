from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AccountViewSet, financial_summary

router = DefaultRouter()
router.register(r'accounts', AccountViewSet)

urlpatterns = [
    # Put the summary path BEFORE the router so it doesn't get confused with an ID lookup
    path('summary/', financial_summary, name='financial-summary'),
    path('', include(router.urls)),
]