import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";

export default function AddPurchase() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Dropdown data states
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Form State matching the new UI
  const [formData, setFormData] = useState({
    product: "",
    entry_by: "",
    unit_cost_bdt: "",
    quantity: "",
    discount_amount: "",
    paid_amount: "",
    supplier_name: "",
    invoice_number: "",
    remarks: "",
    payment_status: "",
    payment_method: "",
  });

  useEffect(() => {
    // Fetch Products and Employees for the dropdowns
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Package the calculated read-only fields to send to the backend as well
    const payload = {
      ...formData,
      total_cost_bdt: totalCost,
      payable_amount: payableAmount,
      due_amount: dueAmount
    };

    try {
      await axiosInstance.post("purchases/", payload);
      navigate("/dashboard/purchase");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to save purchase entry. Check inputs.");
      setLoading(false);
    }
  };

  // --- REAL-TIME CALCULATIONS ---
  const qty = parseFloat(formData.quantity) || 0;
  const unitCost = parseFloat(formData.unit_cost_bdt) || 0;
  const discount = parseFloat(formData.discount_amount) || 0;
  const paid = parseFloat(formData.paid_amount) || 0;

  const totalCost = qty * unitCost;
  const totalAfterDiscount = Math.max(0, totalCost - discount);
  const payableAmount = totalAfterDiscount; // Assuming Payable is exactly Total after discount
  const dueAmount = Math.max(0, payableAmount - paid);

  return (
    <div className="max-w-6xl mx-auto p-6 text-gray-100">
      <h1 className="text-3xl font-bold mb-2">Add Purchase Details</h1>
      <p className="text-gray-400 mb-8">Enter shipment details, supplier invoices, and payment tracking.</p>

      {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-lg space-y-6">
        
        {/* Row 1: Product Selection & Basic Cost */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Product ID *</label>
            <select
              name="product"
              required
              value={formData.product}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Search or Select Product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.product_name || p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Unit Cost (BDT) *</label>
            <input
              type="number"
              step="0.01"
              name="unit_cost_bdt"
              required
              placeholder="0.00"
              value={formData.unit_cost_bdt}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Quantity *</label>
            <input
              type="number"
              name="quantity"
              required
              min="1"
              placeholder="0"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Row 2: Calculations & Discounts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-900/40 p-4 rounded-lg border border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Total Cost (BDT)</label>
            <div className="w-full bg-gray-700/50 border border-gray-600 rounded p-3 text-gray-300 font-mono">
              {totalCost.toFixed(2)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Discount Amount (BDT)</label>
            <input
              type="number"
              step="0.01"
              name="discount_amount"
              placeholder="0.00"
              value={formData.discount_amount}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-400 mb-1">Total Price After Discount (BDT)</label>
            <div className="w-full bg-blue-900/20 border border-blue-800 rounded p-3 text-blue-400 font-bold font-mono">
              {totalAfterDiscount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Row 3: Payments & Dues */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-900/40 p-4 rounded-lg border border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Payable Amount</label>
            <div className="w-full bg-gray-700/50 border border-gray-600 rounded p-3 text-gray-300 font-mono">
              {payableAmount.toFixed(2)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Paid Amount</label>
            <input
              type="number"
              step="0.01"
              name="paid_amount"
              placeholder="0.00"
              value={formData.paid_amount}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-green-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-red-400 mb-1">Due Amount</label>
            <div className="w-full bg-red-900/20 border border-red-800 rounded p-3 text-red-400 font-bold font-mono">
              {dueAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Row 4: Supplier Details & Remarks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Supplier Name</label>
            <input
              type="text"
              name="supplier_name"
              placeholder="Enter supplier name"
              value={formData.supplier_name}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Invoice Number</label>
            <input
              type="text"
              name="invoice_number"
              placeholder="Enter invoice number"
              value={formData.invoice_number}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Remarks</label>
            <input
              type="text"
              name="remarks"
              placeholder="Additional notes"
              value={formData.remarks}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Row 5: Payment Status, Method & Employee */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Payment Status</label>
            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Payment Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="w-full bg-gray-900 border border-gray-600 rounded p-3 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Mobile">Mobile Banking (bKash/Nagad)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Entry By (Employee)</label>
            <select
              name="entry_by"
              value={formData.entry_by}
              onChange={handleChange}
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
        <div className="pt-6 border-t border-gray-700 flex justify-end gap-4">
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
            {loading ? "Saving..." : "Add Purchase"}
          </button>
        </div>
      </form>
    </div>
  );
}