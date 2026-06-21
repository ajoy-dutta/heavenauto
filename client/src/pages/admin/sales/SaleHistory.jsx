import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiPlus, FiShoppingCart, FiSearch, FiX, FiSave, FiTrash2, FiEye } from "react-icons/fi";

export default function SaleHistory() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [brands, setBrands] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit/View Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]); 
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all required relations
      const [saleRes, prodRes, custRes, empRes, brandRes] = await Promise.all([
        axiosInstance.get("sale/sales/"),
        axiosInstance.get("products/"),
        axiosInstance.get("person/customers/"), // Update route if yours is person/api/customers/
        axiosInstance.get("person/employees/"),
        axiosInstance.get("brand/brands/")
      ]);
      
      setSales(saleRes.data.results || saleRes.data);
      setProducts(prodRes.data.results || prodRes.data);
      setCustomers(custRes.data.results || custRes.data);
      setEmployees(empRes.data.results || empRes.data);
      setBrands(brandRes.data.results || brandRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch sales data.");
      setLoading(false);
    }
  };

  // --- HELPERS ---
  const getCustomerName = (id) => {
    if (!id) return "Walk-in Customer";
    const cust = customers.find(c => String(c.id) === String(id));
    return cust ? (cust.shop_name || cust.proprietor_name || cust.name) : "Walk-in Customer";
  };

  const getEmployeeName = (id) => {
    if (!id) return "Unknown";
    const emp = employees.find(e => String(e.id) === String(id));
    if (!emp) return "Unknown";
    return emp.first_name ? `${emp.first_name} ${emp.last_name || ''}`.trim() : emp.full_name || emp.name || emp.employee_id;
  };

  const getBrandName = (item) => {
    const product = products.find(p => String(p.id) === String(item.product) || p.product_name === item.product_name);
    if (!product) return "Unknown Brand";
    const brand = brands.find(b => String(b.id) === String(product.brand));
    return brand ? brand.name : "Unknown Brand";
  };

  // --- EDIT / VIEW FUNCTIONALITY ---
  const openEditModal = (sale) => {
    setEditFormData({
      id: sale.id,
      customer: sale.customer || "",
      sold_by: sale.sold_by || "",
      payment_status: sale.payment_status || "Unpaid",
      remarks: sale.remarks || "",
      invoice_number: sale.invoice_number
    });
    setSelectedItems(sale.items || []);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      // Use PATCH to update only the logistics/header info
      await axiosInstance.patch(`sale/sales/${editFormData.id}/`, {
        customer: editFormData.customer ? parseInt(editFormData.customer) : null,
        sold_by: editFormData.sold_by ? parseInt(editFormData.sold_by) : null,
        payment_status: editFormData.payment_status,
        remarks: editFormData.remarks
      });
      fetchData(); 
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to update sale record.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this Sale? This will return the products to your warehouse stock!")) {
      try {
        await axiosInstance.delete(`sale/sales/${id}/`);
        fetchData();
      } catch (err) {
        alert("Failed to delete sale. Check server logs.");
      }
    }
  };

  // Filter Sales
  const filteredSales = sales.filter((s) => {
    const custName = getCustomerName(s.customer).toLowerCase();
    const productNames = s.items ? s.items.map(i => i.product_name).join(" ").toLowerCase() : "";
    const search = searchTerm.toLowerCase();

    return (
      (s.invoice_number && s.invoice_number.toLowerCase().includes(search)) ||
      custName.includes(search) ||
      productNames.includes(search)
    );
  });

  return (
    <div className="p-4 md:p-6 text-gray-800 bg-gray-50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
            <FiShoppingCart className="text-green-600" /> Sales Ledger
          </h1>
          <p className="text-sm text-gray-500">Track revenue, invoices, and outgoing stock.</p>
        </div>
        <Link
          to="/dashboard/sales/add"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition flex items-center gap-2 text-sm shadow-sm"
        >
          <FiPlus /> New Sale
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Search Bar */}
        <div className="p-3 border-b border-gray-200 flex items-center gap-2 bg-gray-50/50">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by Invoice Number, Product, or Customer Name..."
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
                  <th className="p-3 font-bold">Invoice & Date</th>
                  <th className="p-3 font-bold">Customer Info</th>
                  <th className="p-3 font-bold">Items Summary</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold text-right">Total (৳)</th>
                  <th className="p-3 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => {
                    // Fallback to manual calculation if Django total_amount hasn't synced properly
                    const displayTotal = parseFloat(sale.total_amount) > 0 
                      ? parseFloat(sale.total_amount) 
                      : sale.items?.reduce((sum, i) => sum + parseFloat(i.total_price_bdt || 0), 0);

                    return (
                      <tr key={sale.id} className="hover:bg-green-50/50 transition">
                        <td className="p-3">
                          <div className="font-bold text-green-700">{sale.invoice_number}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(sale.sale_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-gray-800">{getCustomerName(sale.customer)}</div>
                          <div className="text-xs text-gray-500">By: {getEmployeeName(sale.sold_by)}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-gray-700">
                            {sale.items?.length || 0} Products
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]" title={sale.items?.map(i => i.product_name).join(', ')}>
                            {sale.items?.map(i => i.product_name).join(', ')}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            sale.payment_status === 'Paid' ? 'bg-green-100 text-green-700' :
                            sale.payment_status === 'Partial' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {sale.payment_status || "Unpaid"}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-gray-900">
                          {displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center items-center gap-3">
                            <button 
                              onClick={() => openEditModal(sale)}
                              className="text-green-600 hover:text-green-800 transition flex items-center gap-1 font-semibold text-xs bg-green-50 px-2 py-1 rounded border border-green-100"
                              title="View / Edit Record"
                            >
                              <FiEye /> View
                            </button>
                            <button 
                              onClick={() => handleDelete(sale.id)}
                              className="text-red-500 hover:text-red-700 transition"
                              title="Delete Record"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500 text-sm">
                      No sales records found.
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
                  <FiShoppingCart className="text-green-600" /> {editFormData.invoice_number}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">View products and update sale logistics.</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500 transition">
                <FiX size={24} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-4 overflow-y-auto space-y-6">
              
              {/* Product Details (Read Only) */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2 border-b pb-1">Products Sold</h3>
                <div className="border border-gray-200 rounded overflow-hidden">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <tr>
                        <th className="p-2 font-semibold">Product & Brand</th>
                        <th className="p-2 font-semibold text-center">Qty</th>
                        <th className="p-2 font-semibold text-right">Unit Price</th>
                        <th className="p-2 font-semibold text-right">Total</th>
                        <th className="p-2 font-semibold text-right text-emerald-600">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-2">
                            <div className="text-gray-800 font-medium">{item.product_name}</div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wide mt-0.5">
                              {getBrandName(item)}
                            </div>
                          </td>
                          <td className="p-2 text-center">{item.quantity}</td>
                          <td className="p-2 text-right">৳ {parseFloat(item.unit_price_bdt).toFixed(2)}</td>
                          <td className="p-2 text-right font-bold text-gray-700">৳ {parseFloat(item.total_price_bdt).toFixed(2)}</td>
                          <td className="p-2 text-right font-bold text-emerald-600">
                            {item.profit_bdt ? `৳ ${parseFloat(item.profit_bdt).toFixed(2)}` : "-"}
                          </td>
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
                    <label className="block text-xs font-bold text-gray-600 mb-1">Customer</label>
                    <select
                      name="customer" value={editFormData.customer || ""} onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                    >
                      <option value="">-- Walk-in Customer --</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.shop_name || c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Sold By (Employee)</label>
                    <select
                      name="sold_by" required value={editFormData.sold_by || ""} onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none"
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
                    <label className="block text-xs font-bold text-gray-600 mb-1">Payment Status</label>
                    <select
                      name="payment_status" value={editFormData.payment_status} onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none"
                    >
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Remarks / Notes</label>
                    <input
                      type="text" name="remarks" value={editFormData.remarks || ""} onChange={handleEditChange}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-1 focus:ring-green-500 outline-none"
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
                  editLoading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
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