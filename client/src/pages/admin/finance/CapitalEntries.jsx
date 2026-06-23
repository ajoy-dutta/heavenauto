import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import { FiDollarSign, FiPlus, FiList, FiSave, FiTrash2, FiX, FiEye } from "react-icons/fi";

export default function CapitalEntries() {
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals State
  const [showCatModal, setShowCatModal] = useState(false);
  const [showCatListModal, setShowCatListModal] = useState(false);

  // Forms State with New Payment Fields
  const initialFormState = {
    category: "",
    source_name: "",
    amount: "",
    transaction_date: new Date().toISOString().split("T")[0],
    remarks: "",
    
    // New Payment Details
    payment_method: "Cash",
    bank_name: "",
    bank_account_no: "",
    cheque_number: "",
    mfs_provider: "",
    mfs_phone_number: "",
    mfs_transaction_id: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  
  const initialCatForm = { name: "", description: "" };
  const [catFormData, setCatFormData] = useState(initialCatForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesRes, categoriesRes] = await Promise.all([
        axiosInstance.get("capital/entries/"),
        axiosInstance.get("capital/categories/"),
      ]);
      setEntries(entriesRes.data.results ? entriesRes.data.results : entriesRes.data);
      setCategories(categoriesRes.data.results ? categoriesRes.data.results : categoriesRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load capital records.");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCatInputChange = (e) => {
    setCatFormData({ ...catFormData, [e.target.name]: e.target.value });
  };

  // 1. Handle Capital Entry Submit
  const handleEntrySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await axiosInstance.post("capital/entries/", formData);
      setFormData(initialFormState);
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to save entry. Check your data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle New Category Submit (Modal)
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axiosInstance.post("capital/categories/", catFormData);
      setFormData({ ...formData, category: res.data.id });
      setCatFormData(initialCatForm);
      setShowCatModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Failed to create category. It might already exist.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this capital record permanently?")) {
      try {
        await axiosInstance.delete(`capital/entries/${id}/`);
        fetchData();
      } catch (err) {
        alert("Failed to delete record.");
      }
    }
  };

  if (loading) return <div className="p-4 text-gray-600">Loading finance data...</div>;

  return (
    <div className="max-w-7xl mx-auto p-2 md:p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FiDollarSign className="text-blue-600" />
          Capital & Investments
        </h1>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* --- FORM COLUMN --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
            <h2 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2 border-b pb-2">
              <FiPlus /> New Capital Entry
            </h2>
            
            <form onSubmit={handleEntrySubmit} className="space-y-3">
              {/* Category */}
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1">Category Type</label>
                <div className="flex gap-1">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="flex-1 bg-white border border-gray-300 rounded p-1.5 text-sm text-gray-800 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCatModal(true)}
                    className="p-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100 transition"
                    title="Create New Category"
                  >
                    <FiPlus />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCatListModal(true)}
                    className="p-1.5 bg-gray-50 text-gray-600 border border-gray-200 rounded hover:bg-gray-100 transition"
                    title="View Categories"
                  >
                    <FiEye />
                  </button>
                </div>
              </div>

              {/* Source Name */}
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1">Source / Lender Name</label>
                <input
                  type="text"
                  name="source_name"
                  value={formData.source_name}
                  onChange={handleInputChange}
                  placeholder="e.g., BRAC Bank, Owner Name"
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm text-gray-800 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 text-xs font-semibold mb-1">Amount (BDT)</label>
                  <input
                    type="number"
                    step="1"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm text-gray-800 focus:border-blue-500 outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    name="transaction_date"
                    value={formData.transaction_date}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm text-gray-800 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <hr className="border-gray-100 my-2" />

              {/* Payment Method Selector */}
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1">Payment Method</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm text-gray-800 focus:border-blue-500 outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank Transfer / Cheque</option>
                  <option value="MFS">Mobile Banking (bKash/Nagad)</option>
                </select>
              </div>

              {/* CONDITIONAL: Bank Details */}
              {formData.payment_method === 'Bank' && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-blue-800 text-[11px] font-semibold mb-1">Bank Name</label>
                      <input type="text" name="bank_name" value={formData.bank_name} onChange={handleInputChange} placeholder="e.g. BRAC Bank" className="w-full bg-white border border-blue-200 rounded p-1.5 text-sm text-gray-800 outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-blue-800 text-[11px] font-semibold mb-1">Account No</label>
                      <input type="text" name="bank_account_no" value={formData.bank_account_no} onChange={handleInputChange} placeholder="Account Number" className="w-full bg-white border border-blue-200 rounded p-1.5 text-sm text-gray-800 outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-blue-800 text-[11px] font-semibold mb-1">Cheque Number (Optional)</label>
                    <input type="text" name="cheque_number" value={formData.cheque_number} onChange={handleInputChange} placeholder="Cheque No" className="w-full bg-white border border-blue-200 rounded p-1.5 text-sm text-gray-800 outline-none focus:border-blue-500" />
                  </div>
                </div>
              )}

              {/* CONDITIONAL: MFS Details */}
              {formData.payment_method === 'MFS' && (
                <div className="p-3 bg-purple-50 border border-purple-100 rounded-md space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-purple-800 text-[11px] font-semibold mb-1">Provider</label>
                      <select name="mfs_provider" value={formData.mfs_provider} onChange={handleInputChange} className="w-full bg-white border border-purple-200 rounded p-1.5 text-sm text-gray-800 outline-none focus:border-purple-500">
                        <option value="">Select...</option>
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Rocket">Rocket</option>
                        <option value="Upay">Upay</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-purple-800 text-[11px] font-semibold mb-1">Phone Number</label>
                      <input type="text" name="mfs_phone_number" value={formData.mfs_phone_number} onChange={handleInputChange} placeholder="+880..." className="w-full bg-white border border-purple-200 rounded p-1.5 text-sm text-gray-800 outline-none focus:border-purple-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-purple-800 text-[11px] font-semibold mb-1">Transaction ID (TrxID)</label>
                    <input type="text" name="mfs_transaction_id" value={formData.mfs_transaction_id} onChange={handleInputChange} placeholder="TrxID" className="w-full bg-white border border-purple-200 rounded p-1.5 text-sm text-gray-800 outline-none focus:border-purple-500" />
                  </div>
                </div>
              )}

              <hr className="border-gray-100 my-2" />

              {/* Remarks */}
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1">Remarks / Terms</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm text-gray-800 focus:border-blue-500 outline-none resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm transition flex justify-center items-center gap-2"
              >
                <FiSave />
                {isSubmitting ? "Saving..." : "Record Capital"}
              </button>
            </form>
          </div>
        </div>

        {/* --- LIST COLUMN --- */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="p-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiList /> Transaction History
              </h2>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-blue-50 text-blue-800 text-xs uppercase border-b border-blue-100">
                  <tr>
                    <th className="py-2 px-3 font-semibold">ID / Date</th>
                    <th className="py-2 px-3 font-semibold">Category</th>
                    <th className="py-2 px-3 font-semibold">Source & Payment Info</th>
                    <th className="py-2 px-3 font-semibold text-right">Amount (৳)</th>
                    <th className="py-2 px-3 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-400 text-sm">
                        No capital records found. Add your first entry.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50 transition">
                        <td className="py-1.5 px-3">
                          <div className="font-semibold text-gray-800 text-xs">{entry.capital_id}</div>
                          <div className="text-xs text-gray-500">{entry.transaction_date}</div>
                        </td>
                        <td className="py-1.5 px-3">
                          <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs text-gray-600">
                            {entry.category_name}
                          </span>
                        </td>
                        <td className="py-1.5 px-3 max-w-[250px] truncate">
                          <div className="text-gray-800 font-medium">{entry.source_name}</div>
                          
                          {/* Payment Display Logic */}
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              entry.payment_method === 'Cash' ? 'bg-green-100 text-green-700' :
                              entry.payment_method === 'Bank' ? 'bg-blue-100 text-blue-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {entry.payment_method}
                            </span>
                            {entry.payment_method === 'Bank' && (
                              <span className="text-[10px] text-gray-500 truncate">
                                {entry.bank_name} {entry.cheque_number ? `(Chq: ${entry.cheque_number})` : ''}
                              </span>
                            )}
                            {entry.payment_method === 'MFS' && (
                              <span className="text-[10px] text-gray-500 truncate">
                                {entry.mfs_provider} {entry.mfs_transaction_id ? `(Trx: ${entry.mfs_transaction_id})` : ''}
                              </span>
                            )}
                          </div>
                          {entry.remarks && <div className="text-[10px] text-gray-400 truncate mt-0.5">Note: {entry.remarks}</div>}
                        </td>
                        <td className="py-1.5 px-3 font-mono font-bold text-gray-800 text-right">
                          {Number(entry.amount).toLocaleString()}
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="text-gray-400 hover:text-red-500 transition p-1"
                            title="Delete Record"
                          >
                            <FiTrash2 />
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
      </div>

      {/* --- ADD CATEGORY MODAL --- */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Add New Category</h3>
              <button onClick={() => setShowCatModal(false)} className="text-gray-500 hover:text-red-500"><FiX /></button>
            </div>
            <form onSubmit={handleCatSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1">Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={catFormData.name}
                  onChange={handleCatInputChange}
                  placeholder="e.g. Director Loan"
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm text-gray-800 focus:border-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-600 text-xs font-semibold mb-1">Description / Details</label>
                <textarea
                  name="description"
                  value={catFormData.description}
                  onChange={handleCatInputChange}
                  rows="3"
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm text-gray-800 focus:border-blue-500 outline-none resize-none"
                  placeholder="Additional rules or terms for this category..."
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm">
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- VIEW CATEGORIES MODAL --- */}
      {showCatListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden max-h-[80vh] flex flex-col">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Capital Categories Master</h3>
              <button onClick={() => setShowCatListModal(false)} className="text-gray-500 hover:text-red-500"><FiX size={18} /></button>
            </div>
            <div className="p-0 overflow-y-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-blue-50 text-blue-800 text-xs sticky top-0 border-b border-blue-100">
                  <tr>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.length === 0 ? (
                    <tr><td colSpan="2" className="p-4 text-center text-gray-400">No categories found.</td></tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium text-gray-800">{cat.name}</td>
                        <td className="py-2 px-3 text-gray-600 text-xs break-words whitespace-normal min-w-[200px]" title={cat.description}>
                          {cat.description || "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}