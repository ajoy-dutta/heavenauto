import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiPlus, FiBox, FiSearch, FiEdit, FiX, FiSave, FiTrash2 } from "react-icons/fi";

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch purchases, products, and employees concurrently for the edit dropdowns
      const [purRes, prodRes, empRes] = await Promise.all([
        axiosInstance.get("purchases/"),
        axiosInstance.get("products/"),
        axiosInstance.get("employees/")
      ]);
      setPurchases(purRes.data);
      setProducts(prodRes.data);
      setEmployees(empRes.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data.");
      setLoading(false);
    }
  };

  // --- EDIT FUNCTIONALITY ---
  const openEditModal = (purchase) => {
    setEditFormData({
      id: purchase.id,
      product: purchase.product || "",
      entry_by: purchase.entry_by || "",
      quantity: purchase.quantity || "",
      unit_cost_bdt: purchase.unit_cost_bdt || "",
      discount_amount: purchase.discount_amount || "",
      paid_amount: purchase.paid_amount || "",
      supplier_name: purchase.supplier_name || "",
      invoice_number: purchase.invoice_number || "",
      remarks: purchase.remarks || "",
      payment_status: purchase.payment_status || "",
      payment_method: purchase.payment_method || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  // Real-time calculations for the modal
  const qty = parseFloat(editFormData?.quantity) || 0;
  const unitCost = parseFloat(editFormData?.unit_cost_bdt) || 0;
  const discount = parseFloat(editFormData?.discount_amount) || 0;
  const paid = parseFloat(editFormData?.paid_amount) || 0;

  const totalCost = qty * unitCost;
  const totalAfterDiscount = Math.max(0, totalCost - discount);
  const payableAmount = totalAfterDiscount;
  const dueAmount = Math.max(0, payableAmount - paid);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    const payload = {
      ...editFormData,
      total_cost_bdt: totalCost,
      payable_amount: payableAmount,
      due_amount: dueAmount
    };

    try {
      await axiosInstance.put(`purchases/${editFormData.id}/`, payload);
      fetchData(); // Refresh the list
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to update purchase.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this purchase record? This will deduct from your stock!")) {
      try {
        await axiosInstance.delete(`purchases/${id}/`);
        fetchData();
      } catch (err) {
        alert("Failed to delete purchase.");
      }
    }
  };

  // Filter purchases
  const filteredPurchases = purchases.filter((p) =>
    `${p.purchase_id} ${p.invoice_number} ${p.supplier_name} ${p.product_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 text-gray-100 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FiBox className="text-blue-500" /> Purchase History
          </h1>
          <p className="text-sm text-gray-400">Track and edit incoming stock and supplier invoices.</p>
        </div>
        <Link
          to="/dashboard/purchase/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <FiPlus /> Add New Purchase
        </Link>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-700 flex items-center gap-2">
          <FiSearch className="text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Search by ID, Product, Invoice, or Supplier..."
            className="w-full bg-transparent text-white focus:outline-none placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading records...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900 text-gray-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Date & ID</th>
                  <th className="p-4 font-semibold">Product</th>
                  <th className="p-4 font-semibold">Supplier & Invoice</th>
                  <th className="p-4 font-semibold text-right">Qty</th>
                  <th className="p-4 font-semibold text-right">Total Cost (BDT)</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredPurchases.length > 0 ? (
                  filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-gray-750 transition">
                      <td className="p-4">
                        <div className="font-semibold text-blue-400">{purchase.purchase_id}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(purchase.purchase_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-200">
                          {purchase.product_name || `Product ID: ${purchase.product}`}
                        </div>
                        <div className="text-xs text-gray-500">By: {purchase.entry_by_name}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-300">{purchase.supplier_name || "N/A"}</div>
                        <div className="text-xs text-gray-500">Inv: {purchase.invoice_number || "N/A"}</div>
                      </td>
                      <td className="p-4 text-right font-bold text-gray-200">
                        {purchase.quantity}
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-bold text-green-400">
                          ৳ {parseFloat(purchase.total_cost_bdt).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          (৳ {parseFloat(purchase.unit_cost_bdt).toLocaleString()} / unit)
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <button 
                            onClick={() => openEditModal(purchase)}
                            className="text-blue-400 hover:text-blue-300 transition"
                            title="Edit Record"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(purchase.id)}
                            className="text-red-500 hover:text-red-400 transition"
                            title="Delete Record"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No purchase records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- ADVANCED EDIT MODAL --- */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-700 bg-gray-900 shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiEdit className="text-blue-500" /> Edit Full Purchase Record
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition">
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              <form id="editForm" onSubmit={handleEditSubmit} className="space-y-6">
                
                {/* Row 1: Products and Entry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Product</label>
                    <select
                      name="product"
                      value={editFormData.product}
                      onChange={handleEditChange}
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                    >
                      <option value="">Select Product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.product_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Entry By</label>
                    <select
                      name="entry_by"
                      value={editFormData.entry_by}
                      onChange={handleEditChange}
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                    >
                      <option value="">Select Employee</option>
                      {employees.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Core Cost & Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      required
                      min="1"
                      value={editFormData.quantity}
                      onChange={handleEditChange}
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Unit Cost (BDT) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="unit_cost_bdt"
                      required
                      value={editFormData.unit_cost_bdt}
                      onChange={handleEditChange}
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Total Cost</label>
                    <div className="w-full bg-gray-700/50 border border-gray-600 rounded p-2 text-gray-300 font-mono">
                      ৳ {totalCost.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Row 3: Discounts & Payments */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-900/40 p-4 rounded-lg border border-gray-700">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Discount Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      name="discount_amount"
                      value={editFormData.discount_amount}
                      onChange={handleEditChange}
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Paid Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      name="paid_amount"
                      value={editFormData.paid_amount}
                      onChange={handleEditChange}
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-red-400 mb-1">Calculated Due</label>
                    <div className="w-full bg-red-900/20 border border-red-800 rounded p-2 text-red-400 font-bold font-mono">
                      ৳ {dueAmount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Row 4: Status & Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Status</label>
                    <select
                      name="payment_status"
                      value={editFormData.payment_status}
                      onChange={handleEditChange}
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                    >
                      <option value="">Status</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Method</label>
                    <select
                      name="payment_method"
                      value={editFormData.payment_method}
                      onChange={handleEditChange}
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                    >
                      <option value="">Method</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank">Bank</option>
                      <option value="Mobile">Mobile</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Supplier</label>
                    <input
                      type="text"
                      name="supplier_name"
                      value={editFormData.supplier_name}
                      onChange={handleEditChange}
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Invoice</label>
                    <input
                      type="text"
                      name="invoice_number"
                      value={editFormData.invoice_number}
                      onChange={handleEditChange}
                      className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Remarks</label>
                  <input
                    type="text"
                    name="remarks"
                    value={editFormData.remarks}
                    onChange={handleEditChange}
                    className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </form>
            </div>

            {/* Modal Footer (Fixed at bottom) */}
            <div className="p-5 border-t border-gray-700 bg-gray-900 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded font-medium text-gray-400 hover:text-white hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                form="editForm"
                type="submit"
                disabled={editLoading}
                className={`px-5 py-2 rounded font-bold text-white transition flex items-center gap-2 ${
                  editLoading ? "bg-blue-800 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
                }`}
              >
                <FiSave /> {editLoading ? "Saving..." : "Update Full Record"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}