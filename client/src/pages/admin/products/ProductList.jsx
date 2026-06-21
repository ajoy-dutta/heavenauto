import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye, FiImage, FiX, FiUpload, FiFilter } from "react-icons/fi";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  
  // Pagination (Load 20 at a time)
  const [visibleCount, setVisibleCount] = useState(20);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch both products and brands simultaneously
      const [prodRes, brandRes] = await Promise.all([
        axiosInstance.get("products/"),
        axiosInstance.get("brand/brands/")
      ]);
      
      let dataArray = [];
      if (prodRes.data && Array.isArray(prodRes.data.results)) {
        dataArray = prodRes.data.results; 
      } else if (Array.isArray(prodRes.data)) {
        dataArray = prodRes.data; 
      }

      let brandsArray = [];
      if (brandRes.data && Array.isArray(brandRes.data.results)) {
        brandsArray = brandRes.data.results;
      } else if (Array.isArray(brandRes.data)) {
        brandsArray = brandRes.data;
      }

      setProducts(dataArray);
      setBrands(brandsArray);
      setLoading(false);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.response?.data?.detail || "Failed to fetch data from the warehouse database.");
      setProducts([]); 
      setBrands([]);
      setLoading(false);
    }
  };

  const getBrandName = (brandId) => {
    if (!brandId) return "Generic";
    const brand = brands.find(b => String(b.id) === String(brandId));
    return brand ? brand.name : "Unknown";
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product permanently from stock records?")) {
      try {
        await axiosInstance.delete(`products/${id}/`);
        setProducts(products.filter((p) => p.id !== id));
      } catch (err) {
        alert("Failed to delete product. It might be linked to existing purchases/sales.");
      }
    }
  };

  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const importData = new FormData();
    importData.append("excel_file", file);

    setImporting(true);
    setError("");

    try {
      const response = await axiosInstance.post("products/bulk-import/", importData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message); 
      fetchData(); 
    } catch (err) {
      console.error(err);
      setError("Failed to import Excel. Ensure your column names match the system exactly.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Reset pagination when a filter changes
  useEffect(() => {
    setVisibleCount(20);
  }, [searchTerm, selectedCategory, selectedBrand]);

  const filteredProducts = products.filter((product) => {
    const searchLower = (searchTerm || "").toLowerCase();
    const actualBrandName = getBrandName(product.brand).toLowerCase();
    
    // Safely check all fields, preventing null/integer crashes
    const matchesSearch =
      (product.product_name || "").toLowerCase().includes(searchLower) ||
      actualBrandName.includes(searchLower) ||
      (product.product_id || "").toLowerCase().includes(searchLower) ||
      (product.part_number || "").toLowerCase().includes(searchLower) ||
      (product.barcode || "").toLowerCase().includes(searchLower);
      
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesBrand = selectedBrand === "All" || String(product.brand) === String(selectedBrand);
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  // Extract unique categories for the dropdown
  const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];

  // Apply the 20-item workload limit
  const visibleProducts = filteredProducts.slice(0, visibleCount);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-600">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mr-3"></div>
        <span>Loading parts database...</span>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-900 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 relative">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">Motorcycle Parts Master List</h1>
          <p className="text-sm text-gray-500 mt-1">Manage complete inventory data, sourcing, and pricing parameters.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <input type="file" accept=".csv, .xlsx, .xls" ref={fileInputRef} onChange={handleExcelImport} className="hidden" />
          
          <button onClick={() => fileInputRef.current.click()} disabled={importing} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-3 sm:py-2.5 rounded-lg transition shadow hover:shadow-lg disabled:bg-emerald-400">
            <FiUpload />
            {importing ? "Importing..." : "Import Excel"}
          </button>

          <button onClick={() => navigate("/dashboard/products/add")} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-3 sm:py-2.5 rounded-lg transition shadow hover:shadow-lg">
            <FiPlus /> Add New Product
          </button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 text-sm font-semibold">{error}</div>}

      {/* FILTERS & SEARCH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search parts, brands, barcodes..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition text-sm shadow-sm" 
          />
        </div>
        
        <div className="relative">
          <FiFilter className="absolute left-3 top-3.5 text-gray-400" />
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)} 
            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm shadow-sm appearance-none"
          >
            {categories.map((cat) => ( <option key={cat} value={cat}>Category: {cat}</option> ))}
          </select>
        </div>

        <div className="relative">
          <FiFilter className="absolute left-3 top-3.5 text-gray-400" />
          <select 
            value={selectedBrand} 
            onChange={(e) => setSelectedBrand(e.target.value)} 
            className="w-full pl-10 pr-4 py-3 sm:py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm shadow-sm appearance-none"
          >
            <option value="All">Brand: All Brands</option>
            {brands.map((b) => ( <option key={b.id} value={b.id}>Brand: {b.name}</option> ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm scrollbar-thin scrollbar-thumb-gray-300 mb-4">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-xs font-bold uppercase tracking-wider">
              <th className="p-4 w-16 text-center">Image</th>
              <th className="p-4">ID & Part No.</th>
              <th className="p-4">Name & Brand</th>
              <th className="p-4">Source/Status</th>
              <th className="p-4">Cost (BDT)</th>
              <th className="p-4">Retail (BDT)</th>
              <th className="p-4 text-center w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {visibleProducts.length === 0 ? (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">No matching products found.</td></tr>
            ) : (
              visibleProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition items-center">
                  <td className="p-4">
                    {product.image_1 ? (
                      <img src={product.image_1} alt={product.product_name} onClick={() => setFullScreenImage(product.image_1)} className="w-12 h-12 object-cover rounded border border-gray-300 shadow-sm mx-auto cursor-pointer hover:opacity-75 transition hover:scale-105" title="Click to expand image" />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded border border-gray-200 mx-auto"><FiImage className="text-gray-400" size={20} /></div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-indigo-600 font-semibold">{product.product_id}</div>
                    <div className="text-xs text-gray-500 mt-1">{product.part_number || "No Part #"}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900 whitespace-normal min-w-[200px]">{product.product_name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{getBrandName(product.brand)} | {product.category || "No Category"}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-700 font-medium">{product.source}</div>
                    <span className={`px-2 py-0.5 rounded text-[10px] mt-1 font-bold uppercase tracking-wider inline-block ${product.product_status === 'Active' ? 'bg-emerald-100 text-emerald-700' : product.product_status === 'Damaged' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{product.product_status}</span>
                  </td>
                  <td className="p-4 font-semibold text-emerald-600">{parseFloat(product.purchase_cost_bdt || 0).toFixed(2)}</td>
                  <td className="p-4 font-semibold text-cyan-600">{parseFloat(product.retail_price_bdt || 0).toFixed(2)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => setSelectedProduct(product)} className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition" title="View Full Details"><FiEye size={18} /></button>
                      <button onClick={() => navigate(`/dashboard/products/edit/${product.id}`)} className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg border border-indigo-200 transition" title="Edit Product"><FiEdit2 size={18} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition" title="Delete Product"><FiTrash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* LOAD MORE BUTTON */}
      {visibleCount < filteredProducts.length && (
        <div className="flex justify-center mt-4">
          <button 
            onClick={() => setVisibleCount((prev) => prev + 20)}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition shadow-sm border border-gray-300"
          >
            Load 20 More Products ({filteredProducts.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Slide-out Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/60 flex justify-end z-50 transition-opacity backdrop-blur-sm px-0 sm:px-0">
          <div className="w-full max-w-3xl bg-white h-full p-4 sm:p-6 shadow-2xl border-l border-gray-200 overflow-y-auto text-gray-800 animate-slide-in-right">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase tracking-widest px-2 py-1 bg-indigo-50 rounded">{selectedProduct.product_id}</span>
                  <span className="text-[10px] font-bold text-gray-600 px-2 py-1 bg-gray-100 rounded uppercase">{selectedProduct.product_status}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{selectedProduct.product_name}</h3>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-red-600 p-2 sm:p-3 bg-gray-50 hover:bg-red-50 rounded-full transition flex-shrink-0">
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <section>
                <h4 className="text-xs uppercase font-bold text-gray-500 mb-3 border-b border-gray-200 pb-1">Core Identification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div><span className="block text-[10px] text-gray-500 uppercase">Part Number</span><span className="font-mono font-medium text-gray-900 break-words">{selectedProduct.part_number}</span></div>
                  <div><span className="block text-[10px] text-gray-500 uppercase">Brand</span><span className="font-bold text-gray-900 break-words">{getBrandName(selectedProduct.brand)}</span></div>
                  <div><span className="block text-[10px] text-gray-500 uppercase">Category</span><span className="text-gray-900 break-words">{selectedProduct.category || "N/A"}</span></div>
                  <div><span className="block text-[10px] text-gray-500 uppercase">Barcode (EAN-13)</span><span className="font-mono text-gray-900 break-words">{selectedProduct.barcode || "N/A"}</span></div>
                  <div><span className="block text-[10px] text-gray-500 uppercase">Primary Unit</span><span className="text-gray-900">{selectedProduct.unit}</span></div>
                  <div><span className="block text-[10px] text-gray-500 uppercase">Alt Units</span><span className="text-gray-900 break-words">{selectedProduct.alternative_units || "N/A"}</span></div>
                </div>
              </section>

              <section>
                <h4 className="text-xs uppercase font-bold text-emerald-600 mb-3 border-b border-emerald-200 pb-1">Sourcing & Financials</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                  <div><span className="block text-[10px] text-gray-500 uppercase">Source Route</span><span className="text-gray-900 font-semibold">{selectedProduct.source}</span></div>
                  <div><span className="block text-[10px] text-gray-500 uppercase">HS Customs Code</span><span className="text-gray-900 font-mono break-words">{selectedProduct.hs_code || "N/A"}</span></div>
                  <div><span className="block text-[10px] text-gray-500 uppercase">Markup Rule</span><span className="text-gray-900">{selectedProduct.markup_percentage}%</span></div>
                  
                  <div className="pt-2 sm:border-t border-emerald-200"><span className="block text-[10px] text-gray-500 uppercase">Purchase Cost (BDT)</span><span className="text-lg font-bold text-emerald-700">{selectedProduct.purchase_cost_bdt}</span></div>
                  <div className="pt-2 sm:border-t border-emerald-200"><span className="block text-[10px] text-gray-500 uppercase">Wholesale Price (BDT)</span><span className="text-lg font-bold text-blue-600">{selectedProduct.wholesale_price_bdt}</span></div>
                  <div className="pt-2 sm:border-t border-emerald-200"><span className="block text-[10px] text-gray-500 uppercase">Retail Price (BDT)</span><span className="text-lg font-bold text-cyan-600">{selectedProduct.retail_price_bdt}</span></div>

                  {selectedProduct.source === 'Import' && (
                    <>
                      <div><span className="block text-[10px] text-gray-500 uppercase">Indian MRP (INR)</span><span className="text-gray-600 font-medium">₹ {selectedProduct.mrp_inr}</span></div>
                      <div><span className="block text-[10px] text-gray-500 uppercase">Converted MRP (BDT)</span><span className="text-gray-600 font-medium">৳ {selectedProduct.mrp_bdt || "N/A"}</span></div>
                    </>
                  )}
                </div>
              </section>

              <section>
                <h4 className="text-xs uppercase font-bold text-gray-500 mb-3 border-b border-gray-200 pb-1">Taxes & Specs</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div><span className="block text-[10px] text-gray-500 uppercase">VAT Rate Code</span><span className="text-gray-900 font-medium break-words">{selectedProduct.vat_code || "N/A"}</span></div>
                  <div><span className="block text-[10px] text-gray-500 uppercase">Warranty Period</span><span className="text-gray-900 font-medium">{selectedProduct.warranty_period} Months</span></div>
                  <div className="sm:col-span-2"><span className="block text-[10px] text-gray-500 uppercase">Vehicle Compatibility Details</span><span className="text-gray-900 text-sm whitespace-pre-wrap">{selectedProduct.vehicle_compatibility || "Universal / No specific compatibility listed."}</span></div>
                </div>
              </section>

              <section>
                <h4 className="text-xs uppercase font-bold text-amber-600 mb-3 border-b border-amber-200 pb-1">Warehouse Constraints</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <div><span className="block text-[10px] text-gray-500 uppercase">Min Alert Level</span><span className="text-gray-900 font-bold">{selectedProduct.min_stock_level}</span></div>
                  <div><span className="block text-[10px] text-gray-500 uppercase">Max Overstock</span><span className="text-gray-900 font-bold">{selectedProduct.max_stock_level || "No Limit"}</span></div>
                  <div className="col-span-2 sm:col-span-1"><span className="block text-[10px] text-amber-600 uppercase font-bold">Auto-Reorder Point</span><span className="text-amber-600 font-bold">{selectedProduct.reorder_point}</span></div>
                </div>
              </section>

              {(selectedProduct.damage_discount_price > 0 || selectedProduct.damage_remark) && (
                <section>
                  <h4 className="text-xs uppercase font-bold text-red-600 mb-3 border-b border-red-200 pb-1">Damage & Exceptions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-red-50 p-4 rounded-lg border border-red-100">
                    <div><span className="block text-[10px] text-red-600 uppercase font-bold">Damage Discount Price</span><span className="text-red-700 font-bold">{selectedProduct.damage_discount_price} BDT</span></div>
                    <div><span className="block text-[10px] text-gray-500 uppercase">Damage Remarks</span><span className="text-gray-900 text-sm break-words">{selectedProduct.damage_remark}</span></div>
                  </div>
                </section>
              )}

              <section>
                <h4 className="text-xs uppercase font-bold text-gray-500 mb-3 border-b border-gray-200 pb-1">Product Media</h4>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 snap-x">
                  {[selectedProduct.image_1, selectedProduct.image_2, selectedProduct.image_3, selectedProduct.image_4, selectedProduct.image_5].map((img, idx) => {
                    if (!img) return null;
                    return (
                      <button key={idx} onClick={() => setFullScreenImage(img)} title="Click to Zoom" className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 sm:w-20 sm:h-20 bg-white rounded-lg border border-gray-300 hover:border-indigo-500 hover:shadow-md transition group focus:outline-none focus:ring-2 focus:ring-indigo-500 snap-center">
                        <FiImage className="text-gray-400 group-hover:text-indigo-500 mb-1" size={24} />
                        <span className="text-[10px] text-gray-500 font-medium">Image {idx + 1}</span>
                      </button>
                    );
                  })}
                  {!selectedProduct.image_1 && <span className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg w-full text-center">No images uploaded for this product.</span>}
                </div>
              </section>

            </div>
          </div>
        </div>
      )}

      {/* Full-screen Image Viewer */}
      {fullScreenImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex justify-center items-center p-2 sm:p-8 transition-opacity" onClick={() => setFullScreenImage(null)}>
          <div className="relative w-full h-full flex justify-center items-center group">
            <button onClick={(e) => { e.stopPropagation(); setFullScreenImage(null); }} className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-red-600/90 hover:bg-red-700 text-white p-3 sm:p-4 rounded-full transition-all shadow-xl z-10" title="Close Image">
              <FiX size={24} />
            </button>
            <img src={fullScreenImage} alt="Expanded Product View" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl drop-shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
}