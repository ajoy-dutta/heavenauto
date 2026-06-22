import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import { FiDollarSign, FiArrowDownLeft, FiArrowUpRight, FiFileText, FiClock, FiEye, FiX, FiBox, FiUser } from "react-icons/fi";

export default function Payments() {
  const [type, setType] = useState("IN"); 
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [activeOrder, setActiveOrder] = useState(null); // To store details of selected order
  const [orderSummary, setOrderSummary] = useState({ total: 0, paid: 0, due: 0 });
  
  // Modal State for Payment History Details
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState(null);
  
  const initialFormState = {
    amount: "",
    payment_method: "Cash",
    handled_by: "",
    transaction_id: "",
    remarks: "",
    // Bank Fields
    bank_account_number: "",
    bank_account_name: "",
    bank_name: "",
    bank_branch_name: "",
    bank_routing_number: "",
    // MFS Fields
    mfs_mobile_number: ""
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Logic helpers for UI conditions
  const isBank = formData.payment_method === "Bank";
  const isMFS = ["Bkash", "Nagad", "Rocket"].includes(formData.payment_method);

  useEffect(() => {
    fetchEmployees();
    fetchRecentPayments();
  }, []);

  useEffect(() => {
    fetchOrders();
    setSelectedOrderId("");
    setActiveOrder(null);
    setOrderSummary({ total: 0, paid: 0, due: 0 });
    setFormData(prev => ({ ...initialFormState, payment_method: prev.payment_method }));
  }, [type]);

  useEffect(() => {
    if (selectedOrderId) {
      calculateDue(selectedOrderId);
      const order = orders.find(o => o.id.toString() === selectedOrderId.toString());
      setActiveOrder(order || null);
    } else {
      setActiveOrder(null);
    }
  }, [selectedOrderId, recentPayments, orders]);

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("person/employees/");
      setEmployees(res.data.results || res.data);
    } catch (err) { console.error("Failed to fetch employees", err); }
  };

  const fetchRecentPayments = async () => {
    try {
      const res = await axiosInstance.get("payment/payments/");
      setRecentPayments(res.data.results || res.data);
    } catch (err) { console.error("Failed to fetch payments", err); }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const endpoint = type === "IN" ? "sale/sales/" : "purchase/purchases/";
      const res = await axiosInstance.get(endpoint);
      const allOrders = res.data.results || res.data;
      const pendingOrders = allOrders.filter(o => o.payment_status !== "Paid");
      setOrders(pendingOrders);
    } catch (err) { console.error("Failed to fetch orders", err); } 
    finally { setLoading(false); }
  };

  const calculateDue = (orderId) => {
    const order = orders.find(o => o.id.toString() === orderId.toString());
    if (!order) return;

    const total = parseFloat(order.total_amount || 0);
    const relatedPayments = recentPayments.filter(p => {
      if (type === "IN") return p.sale?.toString() === orderId.toString();
      return p.purchase?.toString() === orderId.toString();
    });

    const paid = relatedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const due = total - paid;

    setOrderSummary({ total, paid, due });
    setFormData(prev => ({ ...prev, amount: due.toFixed(2) }));
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderId || !formData.amount) return alert("Select an order and enter an amount.");
    if (parseFloat(formData.amount) > orderSummary.due) return alert("Amount cannot exceed total due.");

    setIsSubmitting(true);
    try {
      const payload = { ...formData, payment_type: type };
      
      if (!isBank) {
        payload.bank_account_number = null; payload.bank_account_name = null;
        payload.bank_name = null; payload.bank_branch_name = null; payload.bank_routing_number = null;
      }
      if (!isMFS) payload.mfs_mobile_number = null;
      
      if (type === "IN") payload.sale = selectedOrderId;
      if (type === "OUT") payload.purchase = selectedOrderId;

      await axiosInstance.post("payment/payments/", payload);
      
      await fetchRecentPayments();
      await fetchOrders();
      
      setSelectedOrderId("");
      setFormData(initialFormState);
      alert("Payment recorded successfully!");
    } catch (err) {
      console.error("Payment failed", err);
      alert("Failed to process payment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
          <FiDollarSign className="text-2xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Center</h1>
          <p className="text-sm text-gray-500">Process incoming revenues and outgoing payments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Payment Form */}
        <div className="lg:col-span-4 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button onClick={() => setType("IN")} className={`flex-1 py-2 flex items-center justify-center rounded-md text-sm font-semibold transition ${type === "IN" ? "bg-green-600 text-white shadow" : "text-gray-500 hover:text-gray-900"}`}>
              <FiArrowDownLeft className="mr-2" /> Receive (Sale)
            </button>
            <button onClick={() => setType("OUT")} className={`flex-1 py-2 flex items-center justify-center rounded-md text-sm font-semibold transition ${type === "OUT" ? "bg-red-600 text-white shadow" : "text-gray-500 hover:text-gray-900"}`}>
              <FiArrowUpRight className="mr-2" /> Pay (Purchase)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Select {type === "IN" ? "Sale Invoice" : "Purchase Order"}</label>
              <select className="w-full bg-white border border-gray-300 rounded p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" value={selectedOrderId} onChange={(e) => setSelectedOrderId(e.target.value)} required>
                <option value="">-- Choose Pending Order --</option>
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {type === "IN" ? o.invoice_number : o.po_number} - ৳{o.total_amount} ({o.payment_status})
                  </option>
                ))}
              </select>
            </div>

            {/* DYNAMIC ORDER DETAILS & SUMMARY */}
            {activeOrder && (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4">
                
                {/* Party Details */}
                <div className="flex items-center text-sm font-semibold text-gray-700 mb-2 border-b border-gray-200 pb-2">
                  <FiUser className="mr-2 text-indigo-500" />
                  {type === "IN" ? `Customer: ${activeOrder.customer_name || 'Walk-in'}` : `Supplier ID: ${activeOrder.supplier}`}
                </div>

                {/* Products List */}
                <div className="mb-3">
                  <p className="text-xs font-bold text-gray-500 uppercase flex items-center mb-1"><FiBox className="mr-1"/> Order Items</p>
                  <ul className="text-xs text-gray-600 list-disc list-inside pl-4 space-y-0.5">
                    {activeOrder.items?.map((item) => (
                      <li key={item.id}>{item.quantity}x {item.product_name}</li>
                    ))}
                  </ul>
                </div>

                {/* Math Summary */}
                <div className="grid grid-cols-3 gap-2 text-center mt-3 pt-3 border-t border-gray-200">
                  <div><p className="text-xs text-gray-500 uppercase">Total</p><p className="font-bold text-gray-900">৳{orderSummary.total.toFixed(2)}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase">Paid</p><p className="font-bold text-green-600">৳{orderSummary.paid.toFixed(2)}</p></div>
                  <div><p className="text-xs text-gray-500 uppercase">Due</p><p className="font-bold text-red-600">৳{orderSummary.due.toFixed(2)}</p></div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Amount (৳)</label>
                <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Method</label>
                <select name="payment_method" value={formData.payment_method} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none">
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Bkash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                </select>
              </div>
            </div>

            {/* CONDITIONAL: MFS Fields */}
            {isMFS && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3">
                <p className="text-xs text-indigo-700 uppercase font-bold tracking-wide">MFS Details</p>
                <input type="text" name="mfs_mobile_number" placeholder="Mobile Number (e.g., 017...)" value={formData.mfs_mobile_number} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 text-sm focus:border-indigo-500 outline-none" required />
                <input type="text" name="transaction_id" placeholder="Transaction ID (TxnID)" value={formData.transaction_id} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 text-sm focus:border-indigo-500 outline-none" required />
              </div>
            )}

            {/* CONDITIONAL: Bank Fields */}
            {isBank && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3">
                <p className="text-xs text-indigo-700 uppercase font-bold tracking-wide">Bank Transfer Details</p>
                <input type="text" name="bank_account_number" placeholder="Account Number *" value={formData.bank_account_number} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 text-sm focus:border-indigo-500 outline-none" required />
                <input type="text" name="bank_account_name" placeholder="Account Name *" value={formData.bank_account_name} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 text-sm focus:border-indigo-500 outline-none" required />
                <input type="text" name="bank_name" placeholder="Bank Name *" value={formData.bank_name} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 text-sm focus:border-indigo-500 outline-none" required />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" name="bank_branch_name" placeholder="Branch (Opt)" value={formData.bank_branch_name} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 text-sm focus:border-indigo-500 outline-none" />
                  <input type="text" name="bank_routing_number" placeholder="Routing (Opt)" value={formData.bank_routing_number} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 text-sm focus:border-indigo-500 outline-none" />
                </div>
                <input type="text" name="transaction_id" placeholder="Check/Trx ID (Opt)" value={formData.transaction_id} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded p-2 text-gray-900 text-sm focus:border-indigo-500 outline-none" />
              </div>
            )}

            {/* Universal Fields */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Processed By</label>
              <select name="handled_by" value={formData.handled_by} onChange={handleInputChange} className="w-full bg-white border border-gray-300 rounded p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none">
                <option value="">-- Select Employee --</option>
                {/* Fixed: Changed emp.name to emp.full_name */}
                {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.full_name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleInputChange} rows="2" className="w-full bg-white border border-gray-300 rounded p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"></textarea>
            </div>

            <button type="submit" disabled={isSubmitting || !selectedOrderId} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition mt-4 disabled:opacity-50">
              {isSubmitting ? "Processing..." : `Process ${type === "IN" ? "Receipt" : "Payment"}`}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Recent Ledger */}
        <div className="lg:col-span-8 bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4"><FiFileText className="mr-2 text-indigo-500" /> Payment Ledger</h2>
          <div className="overflow-x-auto flex-1 border border-gray-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                  <th className="p-3">ID / Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Ref Order</th>
                  <th className="p-3">Method</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentPayments.length === 0 ? (
                  <tr><td colSpan="6" className="p-6 text-center text-gray-500">No recent transactions.</td></tr>
                ) : (
                  recentPayments.map((pay) => (
                    <tr key={pay.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-3">
                        <div className="font-bold text-gray-900">{pay.payment_id}</div>
                        <div className="text-xs text-gray-500 flex items-center mt-1"><FiClock className="mr-1" /> {new Date(pay.payment_date).toLocaleDateString()}</div>
                      </td>
                      <td className="p-3">
                        {pay.payment_type === "IN" ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">Received</span> : <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200">Paid Out</span>}
                      </td>
                      <td className="p-3 font-mono text-gray-700 font-medium">
                        {pay.payment_type === "IN" ? pay.sale_invoice : pay.purchase_po}
                      </td>
                      <td className="p-3 font-semibold text-gray-800">
                        {pay.payment_method}
                      </td>
                      <td className={`p-3 text-right font-black ${pay.payment_type === "IN" ? "text-green-600" : "text-red-600"}`}>
                        {pay.payment_type === "IN" ? "+" : "-"} ৳{parseFloat(pay.amount).toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => setSelectedPaymentDetails(pay)} className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 p-2 rounded transition" title="View Full Details">
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- PAYMENT DETAILS MODAL --- */}
      {selectedPaymentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-gray-200">
            {/* Modal Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900 flex items-center">
                <FiFileText className="mr-2 text-indigo-500" /> Transaction Details
              </h3>
              <button onClick={() => setSelectedPaymentDetails(null)} className="text-gray-400 hover:text-red-500 transition">
                <FiX className="text-2xl" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 space-y-4 text-sm text-gray-700">
              
              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
                <div><p className="text-xs text-gray-500 uppercase mb-1">Payment ID</p><p className="font-bold text-gray-900">{selectedPaymentDetails.payment_id}</p></div>
                <div><p className="text-xs text-gray-500 uppercase mb-1">Date</p><p className="font-bold">{new Date(selectedPaymentDetails.payment_date).toLocaleString()}</p></div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-3">
                <div><p className="text-xs text-gray-500 uppercase mb-1">Order Ref</p><p className="font-bold font-mono text-indigo-600">{selectedPaymentDetails.payment_type === "IN" ? selectedPaymentDetails.sale_invoice : selectedPaymentDetails.purchase_po}</p></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Amount</p>
                  <p className={`font-black text-lg ${selectedPaymentDetails.payment_type === "IN" ? "text-green-600" : "text-red-600"}`}>
                    ৳{parseFloat(selectedPaymentDetails.amount).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-b border-gray-100 pb-3 bg-gray-50 p-3 rounded-lg border">
                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Method Details: <span className="text-gray-900">{selectedPaymentDetails.payment_method}</span></p>
                
                {selectedPaymentDetails.payment_method === 'Bank' && (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p><span className="text-gray-500">Bank:</span> {selectedPaymentDetails.bank_name}</p>
                    <p><span className="text-gray-500">A/C Name:</span> {selectedPaymentDetails.bank_account_name}</p>
                    <p><span className="text-gray-500">A/C No:</span> <span className="font-mono">{selectedPaymentDetails.bank_account_number}</span></p>
                    {selectedPaymentDetails.bank_branch_name && <p><span className="text-gray-500">Branch:</span> {selectedPaymentDetails.bank_branch_name}</p>}
                  </div>
                )}

                {['Bkash', 'Nagad', 'Rocket'].includes(selectedPaymentDetails.payment_method) && (
                  <p><span className="text-gray-500">Mobile No:</span> <span className="font-mono font-bold">{selectedPaymentDetails.mfs_mobile_number}</span></p>
                )}

                {selectedPaymentDetails.transaction_id && (
                  <p className="mt-2"><span className="text-gray-500">Transaction ID:</span> <span className="font-mono">{selectedPaymentDetails.transaction_id}</span></p>
                )}
                {selectedPaymentDetails.payment_method === 'Cash' && <p className="text-gray-500 italic">Standard Hand Cash</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-gray-500 uppercase mb-1">Processed By</p><p className="font-medium text-gray-800">{selectedPaymentDetails.handled_by_name || "Unknown"}</p></div>
              </div>

              {selectedPaymentDetails.remarks && (
                <div><p className="text-xs text-gray-500 uppercase mb-1">Remarks</p><div className="bg-yellow-50 p-2 rounded text-yellow-800 border border-yellow-200">{selectedPaymentDetails.remarks}</div></div>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <button onClick={() => setSelectedPaymentDetails(null)} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 rounded-lg transition">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}