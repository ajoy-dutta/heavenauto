from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

# --- ADD THESE TWO IMPORTS ---
from rest_framework.decorators import api_view
from rest_framework.response import Response

# --- CREATE THE MASTER API ROOT VIEW ---
@api_view(['GET'])
def master_api_root(request):
    """
    Master API directory for Heaven Autos.
    This generates a clickable list of all your app routers.
    """
    return Response({
        "1. Person / HR API": request.build_absolute_uri('/api/person/'),
        "2. Products API": request.build_absolute_uri('/api/products/'),
        "3. Purchase API": request.build_absolute_uri('/api/purchase/'),
        "4. Sale API": request.build_absolute_uri('/api/sale/'),
        "5. Stock / Inventory API": request.build_absolute_uri('/api/stock/'),
        "6. Brand API": request.build_absolute_uri('/api/brand/'),
        "7. Supplier API": request.build_absolute_uri('/api/supplier/'),
        "8. Payment API": request.build_absolute_uri('/api/payment/'),
        "9. Capital API": request.build_absolute_uri('/api/capital/'),
        "10. Expense API": request.build_absolute_uri('/api/expense/'),
        "11. Account API": request.build_absolute_uri('/api/account/'),
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # --- UPDATE YOUR ROOT PATHS ---
    # Now, going to the base url or /api/ will show the master directory
    path('', master_api_root, name='master-api-root'),
    path('api/', master_api_root, name='api-root'),
    
    # Your modular app routes
    path('api/person/', include('person.urls')),
    path('api/products/', include('products.urls')),
    path('api/purchase/', include('purchase.urls')),
    path('api/sale/', include('sale.urls')),
    path('api/stock/', include('stock.urls')),
    path('api/brand/', include('brand.urls')),
    path('api/supplier/', include('supplier.urls')),
    path('api/payment/', include('payment.urls')), 
    path('api/capital/', include('capital.urls')),
    path('api/expense/', include('expense.urls')),
    path('api/account/', include('account.urls')),

    # Token Authentication
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Media Files
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)