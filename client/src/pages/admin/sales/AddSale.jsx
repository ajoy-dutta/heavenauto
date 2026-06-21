import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiPlus, FiTrash2, FiLayers, FiEdit2, FiX, FiShoppingCart, FiUserPlus, FiSave } from "react-icons/fi";

export default function AddSale() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // --- CORE DATA STATES ---
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [stocks, setStocks] = useState([]);

  // --- UI TOGGLE STATE ---
  const [entryMode, setEntryMode] = useState("manual"); // 'manual' or 'brand'
  const [selectedBrands, setSelectedBrands] = useState([]); 

  // --- ORDER HEADER STATE ---
  const [orderData, setOrderData] = useState({
    customer: "",
    sold_by: "",
    invoice_number: "",
    payment_status: "Paid", // Default to paid for retail
    remarks: "",
  });

  // --- ITEM STATES ---
  const [manualItems, setManualItems] = useState([
    { product: "", unit_price_bdt: "", quantity: "" }
  ]);
  const [brandItems, setBrandItems] = useState([]);

  // --- CUSTOMER MODAL STATE ---
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    shop_name: "", proprietor_name: "", mobile1: "", 
    division: "", district: "", town_village: "",
  });

  // --- FETCH ALL INITIAL DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, empRes, custRes, brandRes, stockRes] = await Promise.all([
          axiosInstance.get("products/"),
          axiosInstance.get("person/employees/"),
          axiosInstance.get("person/customers/"), // Adjust if your route is 'person/api/customers/'
          axiosInstance.get("brand/brands/"),
          axiosInstance.get("stock/stocks/")
        ]);
        
        setProducts(prodRes.data.results || prodRes.data);
        setEmployees(empRes.data.results || empRes.data);
        setCustomers(custRes.data.results || custRes.data);
        setBrands(brandRes.data.results || brandRes.data);
        setStocks(stockRes.data.results || stockRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("Warning: Could not load initial data. Check server connection.");
      }
    };
    fetchData();
  }, []);

  // --- HELPERS ---
  const getProductStock = (productId) => {
    const stockItem = stocks.find(s => String(s.product) === String(productId));
    return stockItem ? (stockItem.current_quantity ?? 0) : 0;
  };

  const getBrandName = (brandId) => {
    if (!brandId) return "Generic";
    const brand = brands.find(b => String(b.id) === String(brandId));
    return brand ? brand.name : "Unknown Brand";
  };

  // --- HANDLERS: HEADER ---
  const handleOrderChange = (e) => {
    if (e.target.name === "customer" && e.target.value === "ADD_NEW") {
      setIsCustomerModalOpen(true);
      return;
    }
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  // --- HANDLERS: MANUAL MODE ---
  const handleManualItemChange = (index, field, value) => {
    const newItems = [...manualItems];
    newItems[index][field] = value;

    // Auto-fill price when product is selected
    if (field === "product" && value) {
      const selectedProduct = products.find(p => String(p.id) === String(value));
      if (selectedProduct) {
        newItems[index].unit_price_bdt = selectedProduct.retail_price_bdt || 0;
      }
    }

    setManualItems(newItems);
  };

  const addManualRow = () => {
    setManualItems([...manualItems, { product: "", unit_price_bdt: "", quantity: "" }]);
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
          purchase_cost_bdt: p.purchase_cost_bdt || 0, // Show for reference
          unit_price_bdt: p.retail_price_bdt || "", // Default selling price
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

  // --- NEW CUSTOMER CREATION ---
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setCustomerLoading(true);
    
    const customerPayload = { ...newCustomerData, customer_type: "Retail" };

    try {
      const response = await axiosInstance.post("person/customers/", customerPayload); // Adjust URL if needed
      const newlyCreatedCustomer = response.data;
      
      setCustomers([...customers, newlyCreatedCustomer]);
      setOrderData({ ...orderData, customer: newlyCreatedCustomer.id });
      setIsCustomerModalOpen(false);
      setNewCustomerData({ shop_name: "", proprietor_name: "", mobile1: "", division: "", district: "", town_village: "" }); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to add customer. Check unique fields (mobile).");
    } finally {
      setCustomerLoading(false);
    }
  };

  // --- CALCULATIONS ---
  const activeItems = entryMode === "manual" ? manualItems : brandItems;
  
  const grandTotal = activeItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price_bdt) || 0;
    return sum + (qty * price);
  }, 0);

  // --- SUBMIT SALE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!orderData.sold_by) {
      setError("Please select the Employee making this sale.");
      setLoading(false);
      return;
    }

    let itemsToSubmit = [];
    if (entryMode === "manual") {
      itemsToSubmit = manualItems.filter(i => i.product && parseFloat(i.quantity) > 0 && parseFloat(i.unit_price_bdt) >= 0);
    } else {
      itemsToSubmit = brandItems.filter(i => parseFloat(i.quantity) > 0 && parseFloat(i.unit_price_bdt) >= 0);
    }

    if (itemsToSubmit.length === 0) {
      setError("Please enter valid quantities and prices for at least one product.");
      setLoading(false);
      return;
    }

    const payload = {
      ...orderData,
      customer: orderData.customer ? parseInt(orderData.customer) : null,
      sold_by: parseInt(orderData.sold_by),
      items: itemsToSubmit.map(item => ({
        product: item.product,
        quantity: parseInt(item.quantity, 10),
        unit_price_bdt: parseFloat(item.unit_price_bdt).toFixed(2)
      }))
    };

    try {
      await axiosInstance.post("sale/sales/", payload);
      navigate("/dashboard/sales");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to process sale. Check stock levels and inputs.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 text-gray-800 bg-gray-50 min-h-screen">
      
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <FiShoppingCart className="text-green-600" /> New Sale Order
          </h1>
          <p className="text-sm text-gray-500">Log outgoing products. Stock levels will deduct automatically.</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Total Sale Value</span>
          <div className="text-2xl font-bold text-green-600">৳ {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4 text-sm font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm">
        
        {/* --- HEADER: LOGISTICS --- */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-600 mb-1">Customer</label>
            <select
              name="customer" value={orderData.customer} onChange={handleOrderChange}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-white"
            >
              <option value="">-- Walk-in Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.shop_name ? `${c.shop_name} (${c.proprietor_name})` : c.proprietor_name}
                </option>
              ))}
              <option value="ADD_NEW" className="bg-blue-50 text-blue-700 font-bold">
                + Add New Customer
              </option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Sold By (Employee) *</label>
            <select
              name="sold_by" required value={orderData.sold_by} onChange={handleOrderChange}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-white"
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
            <label className="block text-xs font-bold text-gray-600 mb-1">Payment Status</label>
            <select
              name="payment_status" value={orderData.payment_status} onChange={handleOrderChange}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-white"
            >
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Remarks</label>
            <input
              type="text" name="remarks" value={orderData.remarks} onChange={handleOrderChange}
              className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-white"
            />
          </div>
        </div>

        {/* --- TOGGLE ENTRY MODE --- */}
        <div className="p-4 border-b border-gray-100 flex gap-2">
          <button
            type="button"
            onClick={() => setEntryMode("manual")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition ${entryMode === "manual" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
          >
            <FiEdit2 size={16} /> Manual Entry
          </button>
          <button
            type="button"
            onClick={() => setEntryMode("brand")}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition ${entryMode === "brand" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
          >
            <FiLayers size={16} /> Batch Add by Brand
          </button>
        </div>

        {/* --- ITEMS TABLE --- */}
        <div className="p-0 overflow-x-auto">
          
          {/* MULTI-BRAND DROPDOWN & PILLS UI */}
          {entryMode === "brand" && (
            <div className="p-4 bg-green-50/50 border-b border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 max-w-lg">
                <label className="block text-xs font-bold text-gray-600 mb-1">Select Brands to Load Products</label>
                <select
                  onChange={handleBrandDropdownSelect}
                  defaultValue=""
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none bg-white shadow-sm"
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
                        <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-200">
                          {b.name}
                          <button 
                            type="button" 
                            onClick={() => toggleBrandSelection(id)} 
                            className="text-green-600 hover:text-green-900 bg-white rounded-full p-0.5"
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
                <th className="p-3 w-28 text-center">In Stock</th>
                <th className="p-3 w-32">Purch. Cost (৳)</th>
                <th className="p-3 w-32">Sell Price (৳)</th>
                <th className="p-3 w-28">Quantity</th>
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
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${item.current_stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                      {item.current_stock}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 font-mono">
                    {parseFloat(item.purchase_cost_bdt).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <input
                      type="number" step="0.01" min="0" placeholder="0.00"
                      value={item.unit_price_bdt}
                      onChange={(e) => handleBrandItemChange(index, "unit_price_bdt", e.target.value)}
                      className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-green-500 font-semibold text-green-700 bg-white"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number" min="0" placeholder="0"
                      value={item.quantity}
                      onChange={(e) => handleBrandItemChange(index, "quantity", e.target.value)}
                      className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-green-500 bg-white"
                    />
                  </td>
                  <td className="p-3 text-right font-mono text-gray-600 font-bold">
                    {((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price_bdt) || 0)).toFixed(2)}
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
                const selectedProd = products.find(p => String(p.id) === String(item.product));
                const manualBrandName = selectedProd ? getBrandName(selectedProd.brand) : "";
                const currentStock = selectedProd ? getProductStock(selectedProd.id) : "-";
                const purchaseCost = selectedProd ? parseFloat(selectedProd.purchase_cost_bdt).toFixed(2) : "-";

                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3">
                      <select
                        required
                        value={item.product}
                        onChange={(e) => handleManualItemChange(index, "product", e.target.value)}
                        className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-green-500 bg-white"
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
                    <td className="p-3 text-center">
                       <span className={`px-2 py-1 rounded text-xs font-bold ${currentStock !== "-" && currentStock <= 5 ? 'bg-red-100 text-red-600' : 'text-gray-600'}`}>
                         {currentStock}
                       </span>
                    </td>
                    <td className="p-3 text-gray-500 font-mono">
                      {purchaseCost}
                    </td>
                    <td className="p-3">
                      <input
                        type="number" step="0.01" required min="0" placeholder="0.00"
                        value={item.unit_price_bdt}
                        onChange={(e) => handleManualItemChange(index, "unit_price_bdt", e.target.value)}
                        className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-green-500 font-semibold text-green-700 bg-white"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number" required min="1" placeholder="0"
                        value={item.quantity}
                        onChange={(e) => handleManualItemChange(index, "quantity", e.target.value)}
                        className="w-full border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-green-500 bg-white"
                      />
                    </td>
                    <td className="p-3 text-right font-mono text-gray-600 font-bold">
                      {((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price_bdt) || 0)).toFixed(2)}
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
                className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 font-semibold"
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
            type="button" onClick={() => navigate("/dashboard/sales")}
            className="px-5 py-2 rounded text-sm font-bold text-gray-600 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={loading}
            className={`px-6 py-2 rounded text-sm font-bold text-white transition ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
          >
            {loading ? "Processing..." : "Complete Sale"}
          </button>
        </div>
      </form>

      {/* --- INLINE ADD CUSTOMER MODAL --- */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg border border-gray-200 w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FiUserPlus className="text-green-600" /> Quick Add Customer
              </h2>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-400 hover:text-red-500 transition">
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Shop Name</label>
                  <input
                    type="text" value={newCustomerData.shop_name}
                    onChange={(e) => setNewCustomerData({...newCustomerData, shop_name: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                    placeholder="e.g. Dhaka Motors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Proprietor Name *</label>
                  <input
                    type="text" required value={newCustomerData.proprietor_name}
                    onChange={(e) => setNewCustomerData({...newCustomerData, proprietor_name: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                    placeholder="Owner's Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Mobile Number *</label>
                <input
                  type="text" required value={newCustomerData.mobile1}
                  onChange={(e) => setNewCustomerData({...newCustomerData, mobile1: e.target.value})}
                  className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded border border-gray-200">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Division *</label>
                  <input
                    type="text" required value={newCustomerData.division}
                    onChange={(e) => setNewCustomerData({...newCustomerData, division: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                    placeholder="e.g. Khulna"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">District *</label>
                  <input
                    type="text" required value={newCustomerData.district}
                    onChange={(e) => setNewCustomerData({...newCustomerData, district: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                    placeholder="e.g. Jashore"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Town / Village *</label>
                  <input
                    type="text" required value={newCustomerData.town_village}
                    onChange={(e) => setNewCustomerData({...newCustomerData, town_village: e.target.value})}
                    className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                    placeholder="e.g. Chougacha"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-gray-200">
                <button
                  type="button" onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 rounded text-sm font-bold text-gray-600 hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={customerLoading}
                  className={`px-5 py-2 rounded text-sm font-bold text-white transition flex items-center gap-2 ${customerLoading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  <FiSave /> {customerLoading ? "Saving..." : "Save & Select"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}