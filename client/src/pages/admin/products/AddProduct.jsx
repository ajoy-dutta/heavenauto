import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiSave, FiArrowLeft, FiLayers, FiDollarSign, FiBox, FiTruck, FiAlertCircle, FiImage, FiUpload } from "react-icons/fi";

export default function AddProduct() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    part_number: "", product_name: "", brand: "", category: "", source: "Local",
    hs_code: "", mrp_inr: 0, mrp_bdt: 0, purchase_cost_bdt: 0, markup_percentage: 0,
    wholesale_price_bdt: 0, retail_price_bdt: 0, unit: "piece", alternative_units: "",
    barcode: "", warranty_period: 0, vat_code: "", vehicle_compatibility: "",
    min_stock_level: 5, max_stock_level: "", reorder_point: 5, product_status: "Active",
    damage_discount_price: 0, damage_remark: "",
    image_1: null, image_2: null, image_3: null, image_4: null, image_5: null,
  });

  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode) fetchExistingProduct();
  }, [id]);

  const fetchExistingProduct = async () => {
    setFetchingData(true);
    try {
      const response = await axiosInstance.get(`products/${id}/`);
      const data = response.data;
      setFormData({
        ...data,
        image_1: null, image_2: null, image_3: null, image_4: null, image_5: null,
      });
      setFetchingData(false);
    } catch (err) {
      setError("Failed to load product details for editing.");
      setFetchingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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
      navigate("/dashboard/products");
    } catch (err) {
      console.error(err);
      setError("Failed to import Excel. Ensure your column names match the system exactly.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const submitData = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== "") {
        submitData.append(key, formData[key]);
      }
    }

    try {
      if (isEditMode) {
        await axiosInstance.put(`products/${id}/`, submitData, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await axiosInstance.post("products/", submitData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      navigate("/dashboard/products");
    } catch (err) {
      console.error(err.response?.data);
      setError("Error processing data. Check if part number or barcode is already in use.");
      setLoading(false);
    }
  };

  if (fetchingData) return ( <div className="flex justify-center items-center h-64 text-gray-600"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600 mr-2"></div><span>Retrieving part records...</span></div> );

  // Adjusted classes for better mobile touch targets and visual padding
  const inputClass = "w-full p-3 sm:p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm shadow-sm transition-shadow";
  const labelClass = "block text-xs font-bold text-gray-600 uppercase mb-1.5 tracking-wider";
  const fileInputClass = "w-full p-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none text-sm shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition";

  return (
    <div className="bg-white text-gray-900 p-4 sm:p-6 rounded-xl shadow-md border border-gray-200 max-w-5xl mx-auto mb-10 w-full">
      
      {/* Mobile-Responsive Header: Stacks on small screens, spreads on large */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 border-b border-gray-200 pb-4 mb-6">
        <button onClick={() => navigate("/dashboard/products")} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition text-sm font-medium">
          <FiArrowLeft /> Back to Inventory
        </button>
        <h2 className="text-xl font-bold tracking-tight text-gray-800 text-left sm:text-right">
          {isEditMode ? "🔧 Modify Master Part Record" : "📦 Register New Warehouse Part"}
        </h2>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded mb-6 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        
        {/* Section 1: Core Part Identity */}
        <div className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-indigo-700 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <FiLayers /> 1. Core Identification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <div><label className={labelClass}>Part Number *</label><input type="text" name="part_number" required value={formData.part_number} onChange={handleChange} className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Product Name *</label><input type="text" name="product_name" required value={formData.product_name} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Brand</label><input type="text" name="brand" value={formData.brand} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Category</label><input type="text" name="category" value={formData.category} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Barcode (EAN-13)</label><input type="text" name="barcode" required value={formData.barcode} onChange={handleChange} className={`${inputClass} font-mono bg-gray-50`} /></div>
          </div>
        </div>

        {/* Section 2: Sourcing & Logistics */}
        <div className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-blue-700 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <FiTruck /> 2. Sourcing & Logistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5">
            <div>
              <label className={labelClass}>Source Origin</label>
              <select name="source" value={formData.source} onChange={handleChange} className={inputClass}>
                <option value="Local">Local Purchase</option>
                <option value="Import">Import (India)</option>
              </select>
            </div>
            <div><label className={labelClass}>Customs HS Code</label><input type="text" name="hs_code" value={formData.hs_code} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Primary Unit</label><input type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder="piece, box, set" className={inputClass} /></div>
            <div><label className={labelClass}>Alternative Units</label><input type="text" name="alternative_units" value={formData.alternative_units} onChange={handleChange} placeholder="1 box = 12 pcs" className={inputClass} /></div>
          </div>
        </div>

        {/* Section 3: Financial Valuation & Pricing */}
        <div className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-emerald-700 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <FiDollarSign /> 3. Pricing Rules (BDT & INR)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {/* FIXED: Changed from strict grid-cols-3 to mobile-first grid-cols-1 sm:grid-cols-3 */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 border-b border-gray-300 pb-5 mb-1">
              <div><label className={labelClass}>Purchasing Cost (BDT) *</label><input type="number" step="0.01" name="purchase_cost_bdt" required value={formData.purchase_cost_bdt} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Wholesale Sale (BDT) *</label><input type="number" step="0.01" name="wholesale_price_bdt" required value={formData.wholesale_price_bdt} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Retail Sale (BDT) *</label><input type="number" step="0.01" name="retail_price_bdt" required value={formData.retail_price_bdt} onChange={handleChange} className={inputClass} /></div>
            </div>

            {formData.source === "Import" && (
              <>
                <div><label className="block text-xs font-bold text-indigo-700 uppercase mb-1.5 tracking-wider">Indian MRP (INR)</label><input type="number" step="0.01" name="mrp_inr" value={formData.mrp_inr} onChange={handleChange} className={inputClass} /></div>
                <div><label className="block text-xs font-bold text-indigo-700 uppercase mb-1.5 tracking-wider">Markup Percentage (%)</label><input type="number" step="0.01" name="markup_percentage" value={formData.markup_percentage} onChange={handleChange} className={inputClass} /></div>
                <div><label className="block text-xs font-bold text-indigo-700 uppercase mb-1.5 tracking-wider">Converted MRP (BDT)</label><input type="number" step="0.01" name="mrp_bdt" value={formData.mrp_bdt} onChange={handleChange} className={`${inputClass} bg-indigo-50`} /></div>
              </>
            )}
          </div>
        </div>

        {/* Section 4: Warehouse Alerts & Status */}
        <div className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-amber-600 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <FiBox /> 4. Stock Triggers & Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5">
            <div><label className={labelClass}>Min Stock Alert</label><input type="number" name="min_stock_level" value={formData.min_stock_level} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Auto-Reorder Point</label><input type="number" name="reorder_point" value={formData.reorder_point} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Max Overstock Limit</label><input type="number" name="max_stock_level" value={formData.max_stock_level} onChange={handleChange} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Product Status</label>
              <select name="product_status" value={formData.product_status} onChange={handleChange} className={inputClass}>
                <option value="Active">Active</option>
                <option value="Discontinued">Discontinued</option>
                <option value="Seasonal">Seasonal</option>
                <option value="Damaged">Damaged / Slow Moving</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 5: Specs & Exceptions */}
        <div className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-red-600 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <FiAlertCircle /> 5. Taxes, Warranty & Exceptions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div><label className={labelClass}>VAT Code</label><input type="text" name="vat_code" value={formData.vat_code} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Warranty (Months)</label><input type="number" name="warranty_period" value={formData.warranty_period} onChange={handleChange} className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Vehicle Compatibility</label><textarea name="vehicle_compatibility" value={formData.vehicle_compatibility} onChange={handleChange} rows="2" placeholder="e.g., Honda CB 125 (2018-2024)" className={inputClass}></textarea></div>
          </div>
        </div>

        {/* Section 6: Product Images */}
        <div className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-gray-700 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <FiImage /> 6. Product Media (Upload up to 5 images)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
            <div><label className={labelClass}>Primary Image 1</label><input type="file" accept="image/*" name="image_1" onChange={handleChange} className={fileInputClass} /></div>
            <div><label className={labelClass}>Image 2</label><input type="file" accept="image/*" name="image_2" onChange={handleChange} className={fileInputClass} /></div>
            <div><label className={labelClass}>Image 3</label><input type="file" accept="image/*" name="image_3" onChange={handleChange} className={fileInputClass} /></div>
            <div><label className={labelClass}>Image 4</label><input type="file" accept="image/*" name="image_4" onChange={handleChange} className={fileInputClass} /></div>
            <div><label className={labelClass}>Image 5</label><input type="file" accept="image/*" name="image_5" onChange={handleChange} className={fileInputClass} /></div>
          </div>
        </div>

        {/* --- Action Commit Buttons (Mobile Optimized) --- */}
        {/* FIXED: Flex changes to a column on mobile to stack the buttons nicely, and stretches them full width */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-4">
          
          <input 
            type="file" 
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .csv, .xlsx, .xls" 
            ref={fileInputRef} 
            onChange={handleExcelImport} 
            className="hidden" 
          />

          {!isEditMode ? (
            <button type="button" onClick={() => fileInputRef.current.click()} disabled={importing || loading} className="flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 sm:py-3 rounded-lg shadow transition-all w-full sm:w-auto">
              <FiUpload /> {importing ? "Importing Data..." : "Bulk Import via Excel"}
            </button>
          ) : <div className="hidden sm:block"></div>}

          <button type="submit" disabled={loading || importing} className="flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold px-8 py-3.5 sm:py-3 rounded-lg shadow hover:shadow-lg transition-all w-full sm:w-auto">
            <FiSave /> {loading ? "Saving System Records..." : isEditMode ? "Update Master Record" : "Commit Part To Warehouse"}
          </button>
        </div>
      </form>
    </div>
  );
}