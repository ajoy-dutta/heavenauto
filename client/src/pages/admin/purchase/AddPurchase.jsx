import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiPlus, FiTrash2, FiLayers, FiEdit2, FiX } from "react-icons/fi";

export default function AddPurchase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // --- CORE DATA STATES ---
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [stocks, setStocks] = useState([]);

  // --- UI TOGGLE STATE ---
  const [entryMode, setEntryMode] = useState("manual"); // 'manual' or 'brand'
  const [selectedBrands, setSelectedBrands] = useState([]); 

  // --- ORDER HEADER STATE ---
  const [orderData, setOrderData] = useState({
    supplier: "",
    invoice_number: "",
    remarks: "",
    entry_by: "",
  });

  // --- ITEM STATES ---
  const [manualItems, setManualItems] = useState([
    { product: "", unit_cost_bdt: "", quantity: "" }
  ]);
  const [brandItems, setBrandItems] = useState([]);

  // --- FETCH ALL INITIAL DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, empRes, supRes, brandRes, stockRes] = await Promise.all([
          axiosInstance.get("products/"),
          axiosInstance.get("person/employees/"),
          axiosInstance.get("supplier/suppliers/"),
          axiosInstance.get("brand/brands/"),
          axiosInstance.get("stock/stocks/")
        ]);
        
        setProducts(prodRes.data.results || prodRes.data);
        setEmployees(empRes.data.results || empRes.data);
        setSuppliers(supRes.data.results || supRes.data);
        setBrands(brandRes.data.results || brandRes.data);
        setStocks(stockRes.data.results || stockRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("Warning: Could not load initial data. Check server connection.");
      }
    };
    fetchData();
  }, []);

  // --- HELPER: GET STOCK ---
  const getProductStock = (productId) => {
    const stockItem = stocks.find(s => String(s.product) === String(productId));
    return stockItem ? (stockItem.current_quantity ?? 0) : 0;
  };

  const getBrandName = (brandId) => {
    const brand = brands.find(b => String(b.id) === String(brandId));
    return brand ? brand.name : "Unknown Brand";
  };

  // --- HANDLERS: HEADER ---
  const handleOrderChange = (e) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  // --- HANDLERS: MANUAL MODE ---
  const handleManualItemChange = (index, field, value) => {
    const newItems = [...manualItems];
    newItems[index][field] = value;
    setManualItems(newItems);
  };

  const addManualRow = () => {
    setManualItems([...manualItems, { product: "", unit_cost_bdt: "", quantity: "" }]);
  };

  const removeManualRow = (index) => {
    if (manualItems.length > 1) {
      setManualItems(manualItems.filter((_, i) => i !== index));
    }
  };

  // --- HANDLERS: BRAND MODE (MULTI-SELECT DROPDOWN) ---
  const handleBrandDropdownSelect = (e) => {
    const brandId = Number(e.target.value);
    if (!brandId) return;

    if (!selectedBrands.includes(brandId)) {
      toggleBrandSelection(brandId);
    }
    
    // Reset dropdown visually so user can pick another
    e.target.value = "";
  };

  const toggleBrandSelection = (brandId) => {
    setSelectedBrands((prev) => {
      if (prev.includes(brandId)) {
        // REMOVE BRAND
        const newBrands = prev.filter(id => id !== brandId);
        setBrandItems(currentItems => {
          const removedProductIds = products
            .filter(p => String(p.brand) === String(brandId))
            .map(p => String(p.id));
          return currentItems.filter(item => !removedProductIds.includes(String(item.product)));
        });
        return newBrands;
      } else {
        // ADD BRAND
        const newBrands = [...prev, brandId];
        const productsToAdd = products.filter(p => String(p.brand) === String(brandId));
        
        const newBatchItems = productsToAdd.map(p => ({
          product: p.id,
          product_name: p.product_name || p.name,
          brand_name: getBrandName(p.brand),
          unit_cost_bdt: p.purchase_cost_bdt || "", 
          quantity: "",
          current_stock: getProductStock(p.id)
        }));

        setBrandItems(currentItems => {
          const existingProductIds = currentItems.map(item => String(item.product));
          const uniqueNewItems = newBatchItems.filter(item => !existingProductIds.includes(String(item.product)));
          return [...currentItems, ...uniqueNewItems];
        });

        return newBrands;
      }
    });
  };

  const handleBrandItemChange = (index, field, value) => {
    const newItems = [...brandItems];
    newItems[index][field] = value;
    setBrandItems(newItems);
  };

  const removeBrandRow = (index) => {
    setBrandItems(brandItems.filter((_, i) => i !== index));
  };

  const clearEntireBatch = () => {
    setBrandItems([]);
    setSelectedBrands([]); 
  };

  // --- CALCULATIONS ---
  const activeItems = entryMode === "manual" ? manualItems : brandItems;
  
  const grandTotal = activeItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const cost = parseFloat(item.unit_cost_bdt) || 0;
    return sum + (qty * cost);
  }, 0);

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!orderData.supplier) {
      setError("Please select a Supplier.");
      setLoading(false);
      return;
    }

    let itemsToSubmit = [];
    if (entryMode === "manual") {
      itemsToSubmit = manualItems.filter(i => i.product && parseFloat(i.quantity) > 0 && parseFloat(i.unit_cost_bdt) >= 0);
    } else {
      itemsToSubmit = brandItems.filter(i => parseFloat(i.quantity) > 0 && parseFloat(i.unit_cost_bdt) >= 0);
    }

    if (itemsToSubmit.length === 0) {
      setError("Please enter valid quantities and costs for at least one product.");
      setLoading(false);
      return;
    }

    const payload = {
      ...orderData,
      items: itemsToSubmit.map(item => ({
        product: item.product,
        quantity: parseInt(item.quantity, 10),
        unit_cost_bdt: parseFloat(item.unit_cost_bdt).toFixed(2)
      }))
    };

    try {
      await axiosInstance.post("purchase/purchases/", payload);
      navigate("/dashboard/purchase");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save purchase entry. Check inputs.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 text-gray-800 bg-gray-50 min-h-screen">
      
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Purchase Order</h1>
          <p className="text-sm text-gray-500">Log incoming shipments and update stock.</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Total Order Value</span>
          <div className="text-2xl font-bold text-blue-600">৳ {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4 text-sm font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm">
        
        {/* --- HEADER: LOGISTICS --- */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Supplier *</label>
            <select
              name="supplier" required value={orderData.supplier} onChange={handleOrderChange}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name || s.company_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Invoice Number</label>
            <input
              type="text" name="invoice_number" value={orderData.invoice_number} onChange={handleOrderChange}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Entry By</label>
            <select
              name="entry_by" value={orderData.entry_by} onChange={handleOrderChange}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">-- Select Employee --</option>
              {employees.map(e => {
                const displayName = e.first_name 
                  ? `${e.first_name} ${e.last_name || ''}`.trim() 
                  : e.full_name || e.name || e.employee_id;
                return (
                  <option key={e.id} value={e.id}>
                    {displayName} ({e.employee_id})
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Remarks</label>
            <input
              type="text" name="remarks" value={orderData.remarks} onChange={handleOrderChange}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
            />
          </div>
        </div>

        {/* --- TOGGLE ENTRY MODE --- */}
        <div className="p-4 border-b border-gray-100 flex gap-2">
          <button
            type="button"
            onClick={() => setEntryMode("manual")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition ${entryMode === "manual" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
          >
            <FiEdit2 size={16} /> Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setEntryMode("brand")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition ${entryMode === "brand" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
          >
            <FiLayers size={16} /> Batch Add by Brand
          </button>
        </div>

        {/* --- ITEMS TABLE --- */}
        <div className="p-0 overflow-x-auto">
          
          {/* MULTI-BRAND DROPDOWN & PILLS UI */}
          {entryMode === "brand" && (
            <div className="p-4 bg-blue-50/50 border-b border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 max-w-lg">
                <label className="block text-xs font-bold text-gray-600 mb-1">Select Brands to Load Products</label>
                <select
                  onChange={handleBrandDropdownSelect}
                  defaultValue=""
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white shadow-sm"
                >
                  <option value="" disabled>-- Choose a Brand to Add --</option>
                  {brands.filter(b => !selectedBrands.includes(b.id)).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                
                {/* Active Brand Tags */}
                {selectedBrands.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedBrands.map(id => {
                      const b = brands.find(brand => brand.id === id);
                      return b ? (
                        <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">
                          {b.name}
                          <button 
                            type="button" 
                            onClick={() => toggleBrandSelection(id)} 
                            className="text-blue-500 hover:text-blue-900 bg-white rounded-full p-0.5"
                          >
                            <FiX size={12}/>
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
              
              {brandItems.length > 0 && (
                <button 
                  type="button" 
                  onClick={clearEntireBatch}
                  className="mt-6 text-xs font-bold text-red-500 hover:text-red-700 underline whitespace-nowrap"
                >
                  Clear Entire Batch
                </button>
              )}
            </div>
          )}

          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="p-3 w-1/3">Product & Brand</th>
                <th className="p-3 w-32">Current Stock</th>
                <th className="p-3 w-40">Unit Cost (৳)</th>
                <th className="p-3 w-32">Purchase Qty</th>
                <th className="p-3 w-32 text-right">Row Total</th>
                <th className="p-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody>
              
              {/* RENDER BRAND BATCH LIST */}
              {entryMode === "brand" && brandItems.map((item, index) => (
                <tr key={item.product} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium text-gray-800">{item.product_name}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">{item.brand_name}</div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.current_stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                      {item.current_stock}
                    </span>
                  </td>
                  <td className="p-3">
                    <input
                      type="number" step="0.01" min="0" placeholder="0.00"
                      value={item.unit_cost_bdt}
                      onChange={(e) => handleBrandItemChange(index, "unit_cost_bdt", e.target.value)}
                      className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-blue-500"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number" min="0" placeholder="0"
                      value={item.quantity}
                      onChange={(e) => handleBrandItemChange(index, "quantity", e.target.value)}
                      className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-blue-500"
                    />
                  </td>
                  <td className="p-3 text-right font-mono text-gray-600">
                    {((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost_bdt) || 0)).toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button" onClick={() => removeBrandRow(index)}
                      className="p-1.5 rounded transition text-red-500 hover:bg-red-50"
                      title="Remove from batch"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {/* RENDER MANUAL LIST */}
              {entryMode === "manual" && manualItems.map((item, index) => {
                // Determine brand name for manual row if a product is selected
                const selectedProd = products.find(p => String(p.id) === String(item.product));
                const manualBrandName = selectedProd ? getBrandName(selectedProd.brand) : "";

                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <select
                        required
                        value={item.product}
                        onChange={(e) => handleManualItemChange(index, "product", e.target.value)}
                        className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="">Select Product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.product_name || p.name} ({getBrandName(p.brand)})
                          </option>
                        ))}
                      </select>
                      {manualBrandName && (
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-1 pl-1">
                          {manualBrandName}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                       <span className="text-gray-500 font-bold px-2">
                         {item.product ? getProductStock(item.product) : "-"}
                       </span>
                    </td>
                    <td className="p-3">
                      <input
                        type="number" step="0.01" required min="0" placeholder="0.00"
                        value={item.unit_cost_bdt}
                        onChange={(e) => handleManualItemChange(index, "unit_cost_bdt", e.target.value)}
                        className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number" required min="1" placeholder="0"
                        value={item.quantity}
                        onChange={(e) => handleManualItemChange(index, "quantity", e.target.value)}
                        className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="p-3 text-right font-mono text-gray-600">
                      {((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost_bdt) || 0)).toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button" onClick={() => removeManualRow(index)} disabled={manualItems.length === 1}
                        className={`p-1.5 rounded transition ${manualItems.length === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {entryMode === "manual" && (
            <div className="p-3">
              <button
                type="button" onClick={addManualRow}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-semibold"
              >
                <FiPlus size={16} /> Add Row
              </button>
            </div>
          )}

          {entryMode === "brand" && brandItems.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">
              Use the dropdown above to add brands and load their products into this batch.
            </div>
          )}
        </div>

        {/* --- SUBMIT BAR --- */}
        <div className="p-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
          <button
            type="button" onClick={() => navigate("/dashboard/purchase")}
            className="px-5 py-2 rounded text-sm font-bold text-gray-600 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={loading}
            className={`px-6 py-2 rounded text-sm font-bold text-white transition ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Saving..." : "Save Purchase"}
          </button>
        </div>
      </form>
    </div>
  );
}