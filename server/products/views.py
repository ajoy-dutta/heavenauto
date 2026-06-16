import pandas as pd
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Product
from .serializers import ProductSerializer

# --- 1. Standard CRUD ViewSet (Your existing view) ---
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


# --- 2. New Bulk Excel Import View ---
class BulkProductImportView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('excel_file')
        if not file:
            return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Read the excel file using pandas
            df = pd.read_excel(file)
            
            # Replace empty/NaN cells with None so Django handles defaults safely
            df = df.where(pd.notnull(df), None)

            created_count = 0
            for index, row in df.iterrows():
                # Skip if part_number or barcode already exists to prevent duplicate crashes
                if Product.objects.filter(part_number=row.get('part_number')).exists() or \
                   Product.objects.filter(barcode=row.get('barcode')).exists():
                    continue
                
                # Map Excel columns to Django Model fields
                product = Product(
                    part_number=row.get('part_number'),
                    product_name=row.get('product_name'),
                    brand=row.get('brand', ''),
                    category=row.get('category', ''),
                    source=row.get('source', 'Local'),
                    hs_code=row.get('hs_code', ''),
                    mrp_inr=row.get('mrp_inr', 0) if row.get('mrp_inr') else 0,
                    purchase_cost_bdt=row.get('purchase_cost_bdt', 0),
                    markup_percentage=row.get('markup_percentage', 0) if row.get('markup_percentage') else 0,
                    wholesale_price_bdt=row.get('wholesale_price_bdt', 0),
                    retail_price_bdt=row.get('retail_price_bdt', 0),
                    unit=row.get('unit', 'piece'),
                    alternative_units=row.get('alternative_units', ''),
                    barcode=row.get('barcode', ''),
                    warranty_period=row.get('warranty_period', 0) if row.get('warranty_period') else 0,
                    vat_code=row.get('vat_code', ''),
                    vehicle_compatibility=row.get('vehicle_compatibility', ''),
                    min_stock_level=row.get('min_stock_level', 5),
                    max_stock_level=row.get('max_stock_level'),
                    reorder_point=row.get('reorder_point', 5),
                    product_status=row.get('product_status', 'Active'),
                )
                
                # Calling save() triggers your uuid generation and BDT auto-calculation
                product.save() 
                created_count += 1
            
            return Response(
                {"message": f"Successfully imported {created_count} products."}, 
                status=status.HTTP_201_CREATED
            )
        
        except Exception as e:
            return Response(
                {"error": f"Failed to parse Excel: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )