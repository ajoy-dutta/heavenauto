from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# You need these two imports for media files:
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # This connects the person API to the main project
    path('', include('person.urls')), 
    path('api/person/', include('person.urls')),
    path('api/products/', include('products.urls')),
    path('api/purchases/', include('purchase.urls')),
    path('api/sale/', include('sale.urls')),
    path('api/stock/', include('stock.urls')),

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# --- ADD THIS BLOCK AT THE VERY BOTTOM ---
# This tells Django to serve media files from your MEDIA_ROOT folder during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)