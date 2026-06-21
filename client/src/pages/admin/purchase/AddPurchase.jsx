import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiPlus, FiTrash2, FiLayers, FiEdit2 } from "react-icons/fi";

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
  const [selectedBrand, setSelectedBrand] = useState("");

  // --- ORDER HEADER STATE ---
  const [orderData, setOrderData] = useState({
    supplier: "",
    invoice_number: "",
    remarks: "",
    entry_by: "",
  });

  // --- ITEM STATES ---
  // Mode 1: Manual Rows
  const [manualItems, setManualItems] = useState([
    { product: "", unit_cost_bdt: "", quantity: "" }
  ]);
  // Mode 2: Brand Batch Rows
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
    // Adjust 'product' and 'quantity' keys based on your actual stock model structure
    const stockItem = stocks.find(s => String(s.product) === String(productId));
    return stockItem ? stockItem.quantity || stockItem.current_stock : 0;
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

  // --- HANDLERS: BRAND MODE ---
  const handleBrandSelection = (e) => {
    const brandId = e.target.value;
    setSelectedBrand(brandId);

    if (!brandId) {
      setBrandItems([]);
      return;
    }

    // Filter products by selected brand and build batch array
    const filteredProducts = products.filter(p => String(p.brand) === String(brandId));
    const batchItems = filteredProducts.map(p => ({
      product: p.id,
      product_name: p.product_name || p.name,
      // Pre-fill with existing purchase cost if available, otherwise empty
      unit_cost_bdt: p.purchase_cost_bdt || "", 
      quantity: "",
      current_stock: getProductStock(p.id)
    }));

    setBrandItems(batchItems);
  };

  const handleBrandItemChange = (index, field, value) => {
    const newItems = [...brandItems];
    newItems[index][field] = value;
    setBrandItems(newItems);
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

    // 1. Filter out empty items based on mode
    let itemsToSubmit = [];
    if (entryMode === "manual") {
      itemsToSubmit = manualItems.filter(i => i.product && parseFloat(i.quantity) > 0 && parseFloat(i.unit_cost_bdt) >= 0);
    } else {
      // In brand mode, only submit products where user typed a quantity > 0
      itemsToSubmit = brandItems.filter(i => parseFloat(i.quantity) > 0 && parseFloat(i.unit_cost_bdt) >= 0);
    }

    if (itemsToSubmit.length === 0) {
      setError("Please enter valid quantities and costs for at least one product.");
      setLoading(false);
      return;
    }

    // 2. Format Payload
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
              {employees.map(e => <option key={e.id} value={e.id}>{e.name || e.employee_id}</option>)}
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
            <FiLayers size={16} /> Filter by Brand
          </button>
        </div>

        {/* --- ITEMS TABLE --- */}
        <div className="p-0 overflow-x-auto">
          {entryMode === "brand" && (
            <div className="p-4 bg-blue-50/50 border-b border-gray-100">
              <label className="block text-xs font-bold text-gray-600 mb-1">Select Brand to Load Products</label>
              <select
                value={selectedBrand} onChange={handleBrandSelection}
                className="w-full max-w-sm border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">-- Choose Brand --</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}

          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-100 text-gray-600 font-bold border-b border-gray-200">
              <tr>
                <th className="p-3 w-1/3">Product</th>
                <th className="p-3 w-32">Current Stock</th>
                <th className="p-3 w-40">Unit Cost (৳)</th>
                <th className="p-3 w-32">Purchase Qty</th>
                <th className="p-3 w-32 text-right">Row Total</th>
                {entryMode === "manual" && <th className="p-3 w-12 text-center"></th>}
              </tr>
            </thead>
            <tbody>
              
              {/* RENDER BRAND BATCH LIST */}
              {entryMode === "brand" && brandItems.map((item, index) => (
                <tr key={item.product} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-800">{item.product_name}</td>
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
                </tr>
              ))}

              {/* RENDER MANUAL LIST */}
              {entryMode === "manual" && manualItems.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <select
                      required
                      value={item.product}
                      onChange={(e) => handleManualItemChange(index, "product", e.target.value)}
                      className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="">Select Product</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.product_name || p.name}</option>)}
                    </select>
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
              ))}
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

          {entryMode === "brand" && brandItems.length === 0 && selectedBrand && (
            <div className="p-8 text-center text-gray-400 text-sm">
              No products found for this brand.
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