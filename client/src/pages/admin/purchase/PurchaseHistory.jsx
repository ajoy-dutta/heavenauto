import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiPlus, FiBox, FiSearch, FiX, FiSave, FiTrash2, FiEye } from "react-icons/fi";

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit/View Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]); // To display nested items
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch purchases, suppliers, employees, PLUS brands and products for accurate naming
      const [purRes, supRes, empRes, brandRes, prodRes] = await Promise.all([
        axiosInstance.get("purchase/purchases/"),
        axiosInstance.get("supplier/suppliers/"),
        axiosInstance.get("person/employees/"),
        axiosInstance.get("brand/brands/"),
        axiosInstance.get("products/")
      ]);
      setPurchases(purRes.data.results || purRes.data);
      setSuppliers(supRes.data.results || supRes.data);
      setEmployees(empRes.data.results || empRes.data);
      setBrands(brandRes.data.results || brandRes.data);
      setProducts(prodRes.data.results || prodRes.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch purchase data.");
      setLoading(false);
    }
  };

  // --- EDIT / VIEW FUNCTIONALITY ---
  const openEditModal = (purchase) => {
    setEditFormData({
      id: purchase.id,
      supplier: purchase.supplier || "",
      entry_by: purchase.entry_by || "",
      invoice_number: purchase.invoice_number || "",
      remarks: purchase.remarks || "",
      po_number: purchase.po_number
    });
    setSelectedItems(purchase.items || []);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      // We use PATCH to only update the header info (invoice, remarks, supplier)
      await axiosInstance.patch(`purchase/purchases/${editFormData.id}/`, editFormData);
      fetchData(); // Refresh the list
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to update purchase order.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this PO? This will deduct the products from your stock!")) {
      try {
        await axiosInstance.delete(`purchase/purchases/${id}/`);
        fetchData();
      } catch (err) {
        alert("Failed to delete purchase. Check server logs.");
      }
    }
  };

  // --- HELPERS ---
  const getSupplierName = (id) => {
    const sup = suppliers.find(s => String(s.id) === String(id));
    return sup ? (sup.name || sup.company_name) : "Unknown Supplier";
  };

  const getBrandName = (item) => {
    // Cross-reference the product to find the brand ID, then get the brand name
    const product = products.find(p => String(p.id) === String(item.product) || p.product_name === item.product_name);
    if (!product) return "Unknown Brand";
    
    const brand = brands.find(b => String(b.id) === String(product.brand));
    return brand ? brand.name : "Unknown Brand";
  };

  // Filter purchases
  const filteredPurchases = purchases.filter((p) => {
    const supName = getSupplierName(p.supplier).toLowerCase();
    const productNames = p.items ? p.items.map(i => i.product_name).join(" ").toLowerCase() : "";
    const search = searchTerm.toLowerCase();

    return (
      (p.po_number && p.po_number.toLowerCase().includes(search)) ||
      (p.invoice_number && p.invoice_number.toLowerCase().includes(search)) ||
      supName.includes(search) ||
      productNames.includes(search)
    );
  });

  return (
    <div className="p-4 md:p-6 text-gray-800 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <FiBox className="text-blue-600" /> Purchase History
          </h1>
          <p className="text-sm text-gray-500">Track incoming shipments and PO records.</p>
        </div>
        <Link
          to="/dashboard/purchase/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition flex items-center gap-2 text-sm shadow-sm"
        >
          <FiPlus /> New Purchase
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-3 border-b border-gray-200 flex items-center gap-2 bg-gray-50/50">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by PO Number, Product, Invoice, or Supplier..."
            className="w-full bg-transparent text-sm text-gray-800 focus:outline-none placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm font-medium animate-pulse">Loading records...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500 text-sm font-medium">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
              <thead className="bg-gray-100 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="p-3 font-bold">PO & Date</th>
                  <th className="p-3 font-bold">Supplier Info</th>
                  <th className="p-3 font-bold">Items Summary</th>
                  <th className="p-3 font-bold text-right">Total Amount (৳)</th>
                  <th className="p-3 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPurchases.length > 0 ? (
                  filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="hover:bg-blue-50/50 transition">
                      <td className="p-3">
                        <div className="font-bold text-blue-600">{purchase.po_number}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(purchase.purchase_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-gray-800">{getSupplierName(purchase.supplier)}</div>
                        <div className="text-xs text-gray-500">Inv: {purchase.invoice_number || "N/A"}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-gray-700">
                          {purchase.items?.length || 0} Products
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]" title={purchase.items?.map(i => i.product_name).join(', ')}>
                          {purchase.items?.map(i => i.product_name).join(', ')}
                        </div>
                      </td>
                      <td className="p-3 text-right font-bold text-gray-900">
                        {parseFloat(purchase.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <button 
                            onClick={() => openEditModal(purchase)}
                            className="text-blue-500 hover:text-blue-700 transition flex items-center gap-1 font-semibold text-xs bg-blue-50 px-2 py-1 rounded border border-blue-100"
                            title="View / Edit Record"
                          >
                            <FiEye /> View
                          </button>
                          <button 
                            onClick={() => handleDelete(purchase.id)}
                            className="text-red-500 hover:text-red-700 transition"
                            title="Delete Record"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500 text-sm">
                      No purchase records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- DETAILS / EDIT MODAL --- */}
      {isEditModalOpen && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg border border-gray-200 w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FiBox className="text-blue-600" /> {editFormData.po_number}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">View products and update order header.</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500 transition">
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-4 overflow-y-auto space-y-6">
              
              {/* Product Details (Read Only) */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2 border-b pb-1">Products Received</h3>
                <div className="border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <tr>
                        <th className="p-2 font-semibold">Product & Brand</th>
                        <th className="p-2 font-semibold text-right">Qty</th>
                        <th className="p-2 font-semibold text-right">Unit Cost</th>
                        <th className="p-2 font-semibold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-2">
                            <div className="text-gray-800 font-medium">{item.product_name}</div>
                            {/* NEW: Displays the brand name below the product name */}
                            <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">
                              {getBrandName(item)}
                            </div>
                          </td>
                          <td className="p-2 text-right">{item.quantity}</td>
                          <td className="p-2 text-right">৳ {parseFloat(item.unit_cost_bdt).toFixed(2)}</td>
                          <td className="p-2 text-right font-bold text-gray-700">৳ {parseFloat(item.total_cost_bdt).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Editable Header Form */}
              <form id="editForm" onSubmit={handleEditSubmit}>
                <h3 className="text-sm font-bold text-gray-700 mb-3 border-b pb-1">Order Logistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Supplier</label>
                    <select
                      name="supplier" required value={editFormData.supplier} onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name || s.company_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Entry By</label>
                    <select
                      name="entry_by" value={editFormData.entry_by} onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Employee</option>
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
                    <label className="block text-xs font-bold text-gray-600 mb-1">Invoice Number</label>
                    <input
                      type="text" name="invoice_number" value={editFormData.invoice_number} onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Remarks / Notes</label>
                    <input
                      type="text" name="remarks" value={editFormData.remarks} onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded text-sm font-bold text-gray-600 hover:bg-gray-200 transition"
              >
                Close
              </button>
              <button
                form="editForm"
                type="submit"
                disabled={editLoading}
                className={`px-5 py-2 rounded text-sm font-bold text-white transition flex items-center gap-2 ${
                  editLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <FiSave /> {editLoading ? "Saving..." : "Update Logistics"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}