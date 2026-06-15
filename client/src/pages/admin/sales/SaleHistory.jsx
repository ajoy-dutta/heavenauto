import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiPlus, FiSearch, FiEdit, FiX, FiSave, FiTrash2, FiDollarSign } from "react-icons/fi";

export default function SaleHistory() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [saleRes, prodRes, custRes, empRes] = await Promise.all([
        axiosInstance.get("sale/sales/"), // Mapped to your API
        axiosInstance.get("products/"),
        axiosInstance.get("customers/"),
        axiosInstance.get("employees/")
      ]);
      setSales(saleRes.data);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
      setEmployees(empRes.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- EDIT FUNCTIONALITY ---
  const openEditModal = (sale) => {
    setEditFormData({
      id: sale.id,
      product: sale.product || "",
      customer: sale.customer || "",
      employee: sale.employee || "",
      quantity: sale.quantity || "",
      unit_price_bdt: sale.unit_price_bdt || "",
      discount_bdt: sale.discount_bdt || "",
      invoice_number: sale.invoice_number || "",
      remarks: sale.remarks || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await axiosInstance.put(`sale/sales/${editFormData.id}/`, editFormData);
      fetchData(); // Refresh list to get updated stock and totals
      setIsEditModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update sale.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this sale? This will automatically return the stock to the warehouse.")) {
      try {
        await axiosInstance.delete(`sale/sales/${id}/`);
        fetchData();
      } catch (err) {
        alert("Failed to delete sale.");
      }
    }
  };

  // Filter Sales
  const filteredSales = sales.filter((s) => {
    const searchString = `${s.sale_id} ${s.product_name} ${s.customer_name} ${s.invoice_number}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 text-gray-100 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FiDollarSign className="text-green-500" /> Sales Ledger
          </h1>
          <p className="text-sm text-gray-400">Track revenue, discounts, and customer invoices.</p>
        </div>
        <Link
          to="/dashboard/sales/add"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <FiPlus /> New Sale
        </Link>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
        {/* Search */}
        <div className="p-4 border-b border-gray-700 flex items-center gap-2">
          <FiSearch className="text-gray-400 text-xl" />
          <input
            type="text"
            placeholder="Search by Sale ID, Product, or Customer..."
            className="w-full bg-transparent text-white focus:outline-none placeholder-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading sales data...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900 text-gray-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Date & ID</th>
                  <th className="p-4 font-semibold">Product</th>
                  <th className="p-4 font-semibold">Customer / Invoice</th>
                  <th className="p-4 font-semibold text-right">Qty</th>
                  <th className="p-4 font-semibold text-right">Total (BDT)</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-750 transition">
                      <td className="p-4">
                        <div className="font-semibold text-green-400">{sale.sale_id}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(sale.sale_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-200">{sale.product_name}</div>
                        <div className="text-xs text-gray-500">Sold by: {sale.employee_name}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-300">{sale.customer_name || "Walk-in"}</div>
                        <div className="text-xs text-gray-500">Inv: {sale.invoice_number || "N/A"}</div>
                      </td>
                      <td className="p-4 text-right font-bold text-gray-200">
                        {sale.quantity}
                      </td>
                      <td className="p-4 text-right">
                        <div className="font-bold text-green-400">
                          ৳ {parseFloat(sale.total_price_bdt).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          (৳ {sale.unit_price_bdt}/ea) 
                          {parseFloat(sale.discount_bdt) > 0 && <span className="text-red-400 ml-1">-৳{sale.discount_bdt}</span>}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <button onClick={() => openEditModal(sale)} className="text-blue-400 hover:text-blue-300">
                            <FiEdit size={18} />
                          </button>
                          <button onClick={() => handleDelete(sale.id)} className="text-red-500 hover:text-red-400">
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">No sales records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-700 bg-gray-900 shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiEdit className="text-green-500" /> Edit Sale Record
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white transition">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
              <form id="editSaleForm" onSubmit={handleEditSubmit} className="space-y-6">
                {/* Product / Employee / Customer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Product</label>
                    <select name="product" value={editFormData.product} onChange={handleEditChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none">
                      {products.map(p => <option key={p.id} value={p.id}>{p.product_name || p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Customer</label>
                    <select name="customer" value={editFormData.customer || ""} onChange={handleEditChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none">
                      <option value="">Walk-in</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.shop_name || c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Employee</label>
                    <select name="employee" required value={editFormData.employee} onChange={handleEditChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none">
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Financials */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-900/40 p-4 rounded-lg border border-gray-700">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Quantity *</label>
                    <input type="number" name="quantity" required min="1" value={editFormData.quantity} onChange={handleEditChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Unit Price (BDT) *</label>
                    <input type="number" step="0.01" name="unit_price_bdt" required value={editFormData.unit_price_bdt} onChange={handleEditChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Discount (BDT)</label>
                    <input type="number" step="0.01" name="discount_bdt" value={editFormData.discount_bdt} onChange={handleEditChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none" />
                  </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Invoice Number</label>
                    <input type="text" name="invoice_number" value={editFormData.invoice_number || ""} onChange={handleEditChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Remarks</label>
                    <input type="text" name="remarks" value={editFormData.remarks || ""} onChange={handleEditChange} className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white outline-none" />
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-700 bg-gray-900 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 rounded text-gray-400 hover:text-white hover:bg-gray-700">
                Cancel
              </button>
              <button form="editSaleForm" type="submit" disabled={editLoading} className="px-5 py-2 rounded font-bold text-white bg-green-600 hover:bg-green-500 flex items-center gap-2">
                <FiSave /> {editLoading ? "Saving..." : "Update Sale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}