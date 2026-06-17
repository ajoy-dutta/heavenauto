import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import { FiLayers, FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialFormState = {
    code: "",
    name: "",
    group: "Asset",
    description: "",
  };
  const [formData, setFormData] = useState(initialFormState);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axiosInstance.get("account/accounts/"); 
      const data = response.data.results ? response.data.results : response.data;
      setAccounts(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch Chart of Accounts. Is the server running?");
      setLoading(false);
    }
  };

  // --- Form Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData(initialFormState);
    setEditId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (account) => {
    setModalMode("edit");
    setFormData({
      code: account.code,
      name: account.name,
      group: account.group,
      description: account.description || "",
    });
    setEditId(account.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setEditId(null);
  };

  // --- API Actions ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalMode === "add") {
        await axiosInstance.post("account/accounts/", formData);
      } else {
        await axiosInstance.put(`account/accounts/${editId}/`, formData);
      }
      await fetchAccounts(); // Refresh list
      closeModal();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to save account. Ensure code is unique.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Are you sure you want to delete Account ${code}? This cannot be undone.`)) {
      try {
        await axiosInstance.delete(`account/accounts/${id}/`);
        await fetchAccounts();
      } catch (err) {
        alert("Cannot delete this account. It may have existing journal entries tied to it.");
      }
    }
  };

  // Group accounts by their accounting type
  const accountGroups = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
  const groupedAccounts = accountGroups.reduce((acc, group) => {
    acc[group] = accounts.filter(a => a.group === group);
    return acc;
  }, {});

  if (loading) return <div className="p-4 text-sm text-gray-500 font-medium">Loading accounts...</div>;

  return (
    <div className="p-4 w-full bg-[#f8fafc] min-h-screen">
      {error && <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded">{error}</div>}

      {/* Header & Add Button */}
      <div className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FiLayers className="text-emerald-600" /> Chart of Accounts
          </h1>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-[#10b981] hover:bg-[#059669] text-white px-3 py-1.5 rounded-md transition text-sm font-medium shadow-sm"
        >
          <FiPlus size={16} /> Add Account
        </button>
      </div>

      {/* Grid of Tables by Group */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4">
        {accountGroups.map((group) => (
          <div key={group} className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden flex flex-col">
            {/* Cell Header */}
            <div className="bg-[#f1f5f9] px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-[14px] font-bold text-gray-800 tracking-wide uppercase">{group}</h2>
              <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                {groupedAccounts[group].length} Accounts
              </span>
            </div>

            {/* Cell Table */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm text-gray-700 whitespace-nowrap">
                <thead className="text-gray-500 text-xs uppercase bg-white border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2 font-semibold w-20">Code</th>
                    <th className="px-4 py-2 font-semibold">Name</th>
                    <th className="px-4 py-2 font-semibold text-right w-28">Balance</th>
                    <th className="px-4 py-2 font-semibold text-center w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {groupedAccounts[group].length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-4 py-4 text-center text-xs text-gray-400 italic">
                        No {group.toLowerCase()} accounts.
                      </td>
                    </tr>
                  ) : (
                    groupedAccounts[group].map((acc) => {
                      const balanceValue = parseFloat(acc.balance || 0);
                      return (
                        <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-1.5 text-emerald-700 font-mono text-[13px] font-semibold">{acc.code}</td>
                          <td className="px-4 py-1.5 text-gray-800 text-[13px]">{acc.name}</td>
                          <td className={`px-4 py-1.5 text-right font-medium text-[13px] ${balanceValue < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {balanceValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-1.5 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button 
                                onClick={() => openEditModal(acc)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                title="Edit"
                              >
                                <FiEdit2 size={13} />
                              </button>
                              <button 
                                onClick={() => handleDelete(acc.id, acc.code)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete"
                              >
                                <FiTrash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-[15px] font-bold text-gray-800">
                {modalMode === "add" ? "Create New Account" : "Edit Account"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition">
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Account Code</label>
                  <input 
                    type="text" 
                    name="code"
                    required
                    value={formData.code} 
                    onChange={handleInputChange}
                    placeholder="e.g. 1000"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1">Group</label>
                  <select 
                    name="group"
                    value={formData.group} 
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Equity">Equity</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Account Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name} 
                  onChange={handleInputChange}
                  placeholder="e.g. Cash, Accounts Receivable"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  name="description"
                  rows="2"
                  value={formData.description} 
                  onChange={handleInputChange}
                  placeholder="Notes about this account..."
                  className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-gray-100 mt-5">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}