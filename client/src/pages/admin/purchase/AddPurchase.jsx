import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiPlus, FiTrash2 } from "react-icons/fi"; // Added icons for the dynamic rows

export default function AddPurchase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);

  // 1. Order Level State
  const [orderData, setOrderData] = useState({
    entry_by: "",
    discount_amount: "",
    paid_amount: "",
    supplier_name: "",
    invoice_number: "",
    remarks: "",
    payment_method: "",
  });

  // 2. Dynamic Items State (Array of products)
  const [items, setItems] = useState([
    { product: "", unit_cost_bdt: "", quantity: "" }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, empRes] = await Promise.all([
          axiosInstance.get("products/"),
          axiosInstance.get("employees/")
        ]);
        setProducts(prodRes.data);
        setEmployees(empRes.data);
      } catch (err) {
        console.error("Failed to fetch dropdown data", err);
      }
    };
    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleOrderChange = (e) => {
    setOrderData({ ...orderData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { product: "", unit_cost_bdt: "", quantity: "" }]);
  };

  const removeItemRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // --- REAL-TIME CALCULATIONS ---
  // Calculate Grand Total by summing all item rows
  const grandTotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const cost = parseFloat(item.unit_cost_bdt) || 0;
    return sum + (qty * cost);
  }, 0);

  const discount = parseFloat(orderData.discount_amount) || 0;
  const paid = parseFloat(orderData.paid_amount) || 0;
  
  const payableAmount = Math.max(0, grandTotal - discount);
  const dueAmount = Math.max(0, payableAmount - paid);

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation: Ensure no empty item rows
    const hasEmptyItems = items.some(i => !i.product || !i.quantity || !i.unit_cost_bdt);
    if (hasEmptyItems) {
      setError("Please fill out all product fields or remove empty rows.");
      setLoading(false);
      return;
    }

    const payload = {
      ...orderData,
      items: items // Send the array of items to the backend
    };

    try {
      // Ensure your backend endpoint matches your ViewSet for PurchaseOrder
      await axiosInstance.post("purchases/", payload);
      navigate("/dashboard/purchase");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save purchase entry. Check inputs.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-100">
      <h1 className="text-3xl font-bold mb-2">Add Purchase Details</h1>
      <p className="text-gray-400 mb-8">Enter shipment details, multiple items, and payment tracking.</p>

      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg space-y-6">
        
        {/* --- DYNAMIC PRODUCTS SECTION --- */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-blue-400 border-b border-gray-700 pb-2">Products Received</h2>
          
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-900/50 p-4 rounded-lg border border-gray-700">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-gray-400 mb-1">Product *</label>
                <select
                  required
                  value={item.product}
                  onChange={(e) => handleItemChange(index, "product", e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Product</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.product_name || p.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-3">
                <label className="block text-sm font-medium text-gray-400 mb-1">Unit Cost (BDT) *</label>
                <input
                  type="number" step="0.01" required placeholder="0.00"
                  value={item.unit_cost_bdt}
                  onChange={(e) => handleItemChange(index, "unit_cost_bdt", e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Quantity *</label>
                <input
                  type="number" required min="1" placeholder="0"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1">Row Total</label>
                <div className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-gray-300 font-mono">
                  {((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost_bdt) || 0)).toFixed(2)}
                </div>
              </div>

              <div className="col-span-1 flex justify-center pb-1">
                <button
                  type="button"
                  onClick={() => removeItemRow(index)}
                  disabled={items.length === 1}
                  className={`p-3 rounded-lg transition ${items.length === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-red-400 hover:bg-red-500/20'}`}
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItemRow}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium px-2"
          >
            <FiPlus /> Add Another Product
          </button>
        </div>

        {/* --- FINANCIAL CALCULATIONS SECTION --- */}
        <h2 className="text-xl font-semibold text-green-400 border-b border-gray-700 pb-2 mt-8">Order Summary & Payments</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-900/40 p-4 rounded-lg border border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Grand Total</label>
            <div className="w-full bg-gray-700/50 border border-gray-600 rounded p-3 text-gray-300 font-mono">
              {grandTotal.toFixed(2)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Discount (BDT)</label>
            <input
              type="number" step="0.01" name="discount_amount" placeholder="0.00"
              value={orderData.discount_amount}
              onChange={handleOrderChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-400 mb-1">Payable Amount</label>
            <div className="w-full bg-blue-900/20 border border-blue-800 rounded p-3 text-blue-400 font-bold font-mono">
              {payableAmount.toFixed(2)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Paid Amount</label>
            <input
              type="number" step="0.01" name="paid_amount" placeholder="0.00"
              value={orderData.paid_amount}
              onChange={handleOrderChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-500 focus:outline-none"
            />
          </div>
        </div>

        {/* --- INVOICE & LOGISTICS SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Supplier Name</label>
            <input
              type="text" name="supplier_name" placeholder="Enter supplier name"
              value={orderData.supplier_name}
              onChange={handleOrderChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Invoice Number</label>
            <input
              type="text" name="invoice_number" placeholder="Enter invoice number"
              value={orderData.invoice_number}
              onChange={handleOrderChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
            <select
              name="payment_method"
              value={orderData.payment_method}
              onChange={handleOrderChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Mobile">Mobile Banking</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Remarks</label>
            <input
              type="text" name="remarks" placeholder="Additional notes"
              value={orderData.remarks}
              onChange={handleOrderChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Entry By (Employee)</label>
            <select
              name="entry_by"
              value={orderData.entry_by}
              onChange={handleOrderChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Select Employee --</option>
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.name || e.employee_id}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-700 flex justify-end gap-4 items-center">
          <div className="text-right mr-4">
            <span className="text-gray-400 text-sm block">Current Due:</span>
            <span className={`text-lg font-bold ${dueAmount > 0 ? 'text-red-400' : 'text-green-400'}`}>
              ৳ {dueAmount.toFixed(2)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/dashboard/purchase")}
            className="px-6 py-3 rounded-lg font-medium text-gray-300 hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 rounded-lg font-bold text-white transition shadow-lg ${
              loading ? "bg-blue-800 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
            }`}
          >
            {loading ? "Saving Order..." : "Finalize Purchase Order"}
          </button>
        </div>
      </form>
    </div>
  );
}