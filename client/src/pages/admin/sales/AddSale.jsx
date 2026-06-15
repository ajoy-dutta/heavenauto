import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiShoppingCart, FiUserPlus, FiX, FiSave } from "react-icons/fi";

export default function AddSale() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Dropdown Data
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Sale Form State
  const [formData, setFormData] = useState({
    customer: "",
    product: "",
    unit_price_bdt: "",
    quantity: "1",
    discount_bdt: "",
    paid_amount: "",
    payment_method: "",
    payment_status: "",
    invoice_number: "",
    remarks: "",
    employee: "", 
  });

  // New Customer Modal State (ADDED MISSING REQUIRED FIELDS)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    shop_name: "",
    proprietor_name: "",
    mobile1: "",
    division: "",
    district: "",
    town_village: "",
  });

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [prodRes, custRes, empRes] = await Promise.all([
        axiosInstance.get("products/"),
        axiosInstance.get("person/api/customers/"),
        axiosInstance.get("person/api/employees/")
      ]);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
      setEmployees(empRes.data);
    } catch (err) {
      console.error("Failed to fetch dropdown data", err);
      setError("Failed to load data. Please check connection.");
    }
  };

  const handleChange = (e) => {
    // Intercept Customer Dropdown to open modal
    if (e.target.name === "customer" && e.target.value === "ADD_NEW") {
      setIsCustomerModalOpen(true);
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Real-Time Calculations ---
  const qty = parseFloat(formData.quantity) || 0;
  const unitPrice = parseFloat(formData.unit_price_bdt) || 0;
  const discount = parseFloat(formData.discount_bdt) || 0;
  const paid = parseFloat(formData.paid_amount) || 0;

  const totalPrice = Math.max(0, (qty * unitPrice) - discount);
  const dueAmount = Math.max(0, totalPrice - paid);

  // --- Submit Sale ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // CLEAN PAYLOAD: Convert empty strings to null, strings to Numbers
    const payload = {
      ...formData,
      customer: formData.customer ? parseInt(formData.customer) : null,
      product: parseInt(formData.product),
      employee: parseInt(formData.employee),
      quantity: parseInt(formData.quantity),
      unit_price_bdt: parseFloat(formData.unit_price_bdt),
      discount_bdt: parseFloat(formData.discount_bdt) || 0,
      paid_amount: parseFloat(formData.paid_amount) || 0,
      total_price_bdt: totalPrice,
      due_amount: dueAmount
    };

    try {
      await axiosInstance.post("sale/sales/", payload);
      navigate("/dashboard/sales");
    } catch (err) {
      console.error("Sale Error:", err.response?.data);
      
      let errorMsg = "Failed to process sale.";
      if (err.response?.data && typeof err.response.data === "object") {
        errorMsg = Object.entries(err.response.data)
          .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
          .join(" | ");
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- Create New Customer Inline ---
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setCustomerLoading(true);
    
    // Auto-fill customer type as required by Django
    const customerPayload = {
      ...newCustomerData,
      customer_type: "Retail", 
    };

    try {
      const response = await axiosInstance.post("person/api/customers/", customerPayload);
      const newlyCreatedCustomer = response.data;
      
      // Update local state and auto-select the new customer
      setCustomers([...customers, newlyCreatedCustomer]);
      setFormData({ ...formData, customer: newlyCreatedCustomer.id });
      
      setIsCustomerModalOpen(false);
      // Reset Modal Form
      setNewCustomerData({ 
        shop_name: "", proprietor_name: "", mobile1: "", 
        division: "", district: "", town_village: "" 
      }); 
    } catch (err) {
      console.error("Customer Error:", err.response?.data);
      
      let errorMsg = "Failed to add customer.";
      if (err.response?.data && typeof err.response.data === "object") {
        errorMsg = Object.entries(err.response.data)
          .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
          .join(" | ");
      }
      alert(errorMsg); // This will pop up showing exactly what field Django blocked
    } finally {
      setCustomerLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-100 relative">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <FiShoppingCart className="text-green-500" /> Process New Sale
      </h1>
      <p className="text-gray-400 mb-8">Log outgoing inventory. Stock levels will deduct automatically.</p>

      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded mb-6 font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg space-y-6">
        
        {/* Row 1: Identity & Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Customer Name</label>
            <select
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-500 outline-none"
            >
              <option value="">-- Walk-in Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.shop_name ? `${c.shop_name} (${c.proprietor_name})` : c.proprietor_name}
                </option>
              ))}
              <option value="ADD_NEW" className="bg-blue-900 text-white font-bold">
                + Add New Customer
              </option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Product Name *</label>
            <select
              name="product"
              required
              value={formData.product}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-500 outline-none"
            >
              <option value="">Select Product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.product_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Unit Price (BDT) *</label>
            <input
              type="number"
              step="0.01"
              name="unit_price_bdt"
              required
              placeholder="0.00"
              value={formData.unit_price_bdt}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-500 outline-none"
            />
          </div>
        </div>

        {/* Row 2: Totals & Discounts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-900/40 p-5 rounded-lg border border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Quantity *</label>
            <input
              type="number"
              name="quantity"
              required
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Discount Amount (BDT)</label>
            <input
              type="number"
              step="0.01"
              name="discount_bdt"
              placeholder="0.00"
              value={formData.discount_bdt}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-green-400 mb-1">Total Price (BDT)</label>
            <div className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-green-400 font-bold font-mono text-lg">
              ৳ {totalPrice.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Row 3: Payments & Dues */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-900/40 p-5 rounded-lg border border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Paid Amount (BDT)</label>
            <input
              type="number"
              step="0.01"
              name="paid_amount"
              placeholder="0.00"
              value={formData.paid_amount}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-red-400 mb-1">Due Amount (BDT)</label>
            <div className="w-full bg-red-900/20 border border-red-800 rounded p-3 text-red-400 font-bold font-mono text-lg">
              ৳ {dueAmount.toFixed(2)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-500 outline-none"
            >
              <option value="">Select Method</option>
              <option value="Cash">Cash</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Mobile">Mobile Banking</option>
            </select>
          </div>
        </div>

        {/* Row 4: Status & Admin */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Payment Status</label>
            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-500 outline-none"
            >
              <option value="">Select Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Invoice Number</label>
            <input
              type="text"
              name="invoice_number"
              placeholder="e.g. INV-2026-01"
              value={formData.invoice_number}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Remarks</label>
            <input
              type="text"
              name="remarks"
              placeholder="Notes, delivery info..."
              value={formData.remarks}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-500 outline-none"
            />
          </div>
        </div>

        {/* Row 5: Employee Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Sold By (Employee Name) *</label>
            <select
              name="employee"
              required
              value={formData.employee}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-500 outline-none"
            >
              <option value="">-- Select Employee --</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name || e.first_name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="pt-6 border-t border-gray-700 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/sales")}
            className="px-6 py-3 rounded-lg font-medium text-gray-300 hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-bold text-white transition shadow-lg ${
              loading ? "bg-green-800 cursor-not-allowed" : "bg-green-600 hover:bg-green-500 shadow-green-500/20"
            }`}
          >
            {loading ? "Processing..." : "Complete Sale"}
          </button>
        </div>
      </form>

      {/* --- INLINE ADD CUSTOMER MODAL WITH ALL REQUIRED FIELDS --- */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-700 bg-gray-900">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiUserPlus className="text-blue-500" /> Quick Add Customer
              </h2>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-400 hover:text-white">
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Identity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Shop Name</label>
                  <input
                    type="text"
                    value={newCustomerData.shop_name}
                    onChange={(e) => setNewCustomerData({...newCustomerData, shop_name: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white outline-none"
                    placeholder="e.g. Dhaka Motors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Proprietor Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerData.proprietor_name}
                    onChange={(e) => setNewCustomerData({...newCustomerData, proprietor_name: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white outline-none"
                    placeholder="Owner's Name"
                  />
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={newCustomerData.mobile1}
                  onChange={(e) => setNewCustomerData({...newCustomerData, mobile1: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white outline-none"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              {/* REQUIRED ADDRESS FIELDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-900/50 rounded border border-gray-700">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Division *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerData.division}
                    onChange={(e) => setNewCustomerData({...newCustomerData, division: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white outline-none"
                    placeholder="e.g. Khulna"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerData.district}
                    onChange={(e) => setNewCustomerData({...newCustomerData, district: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white outline-none"
                    placeholder="e.g. Jashore"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Town / Village *</label>
                  <input
                    type="text"
                    required
                    value={newCustomerData.town_village}
                    onChange={(e) => setNewCustomerData({...newCustomerData, town_village: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white outline-none"
                    placeholder="e.g. Chougacha"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 mt-4 rounded text-gray-400 hover:text-white hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={customerLoading}
                  className="px-5 py-2 mt-4 rounded font-bold text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-2"
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