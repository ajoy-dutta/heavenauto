import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../../api/axios";
import {
  FiDollarSign,
  FiPlus,
  FiList,
  FiSave,
  FiTrash2,
  FiX,
  FiEye,
  FiTag,
  FiCalendar,
  FiInfo,
} from "react-icons/fi";

export default function CapitalEntries() {
  const [entries, setEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCatModal, setShowCatModal] = useState(false);
  const [showCatListModal, setShowCatListModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const initialFormState = {
    category: "",
    source_name: "",
    amount: "",
    transaction_date: new Date().toISOString().split("T")[0],
    remarks: "",
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

  const stats = useMemo(() => {
    const totalCapital = entries.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalEntries = entries.length;
    const latestDate =
      entries.length > 0
        ? entries.reduce((latest, e) =>
            new Date(e.transaction_date) > new Date(latest.transaction_date)
              ? e
              : latest
          ).transaction_date
        : null;
    return { totalCapital, totalEntries, latestDate };
  }, [entries]);

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
      setEntries(
        entriesRes.data.results ? entriesRes.data.results : entriesRes.data
      );
      setCategories(
        categoriesRes.data.results ? categoriesRes.data.results : categoriesRes.data
      );
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

  const openViewModal = (entry) => {
    setSelectedEntry(entry);
    setShowViewModal(true);
  };

  if (loading)
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200"></div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-64 bg-gray-200"></div>
            <div className="col-span-2 h-64 bg-gray-200"></div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-3 bg-gray-50 min-h-screen">
      {/* Stats - Compact bordered grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-gray-300 mb-4 bg-white">
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiDollarSign className="text-blue-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Capital
            </p>
            <p className="text-lg font-bold text-gray-800">
              ৳ {stats.totalCapital.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiList className="text-indigo-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Entries
            </p>
            <p className="text-lg font-bold text-gray-800">{stats.totalEntries}</p>
          </div>
        </div>
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiTag className="text-green-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Categories
            </p>
            <p className="text-lg font-bold text-gray-800">{categories.length}</p>
          </div>
        </div>
        <div className="p-2 flex items-center gap-2">
          <FiCalendar className="text-purple-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Latest Entry
            </p>
            <p className="text-sm font-semibold text-gray-700">
              {stats.latestDate
                ? new Date(stats.latestDate).toLocaleDateString("en-BD", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Form Section - Table-like bordered card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-300 overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-300 px-3 py-1.5 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiPlus className="text-blue-600" />
                New Capital Entry
              </h2>
            </div>
            <form onSubmit={handleEntrySubmit} className="p-3">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50 w-1/3">
                      Category
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <div className="flex gap-1">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="flex-1 bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          required
                        >
                          <option value="">— Select —</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowCatModal(true)}
                          className="p-1 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100"
                          title="New Category"
                        >
                          <FiPlus size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCatListModal(true)}
                          className="p-1 bg-gray-50 text-gray-600 border border-gray-200 rounded hover:bg-gray-100"
                          title="View Categories"
                        >
                          <FiEye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50">
                      Source / Lender
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        name="source_name"
                        value={formData.source_name}
                        onChange={handleInputChange}
                        placeholder="e.g. BRAC Bank"
                        className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50">
                      Amount (BDT)
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        step="1"
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded p-1 text-sm font-mono text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50">
                      Date
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="date"
                        name="transaction_date"
                        value={formData.transaction_date}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50">
                      Payment Method
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <select
                        name="payment_method"
                        value={formData.payment_method}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Bank">Bank Transfer / Cheque</option>
                        <option value="MFS">Mobile Banking</option>
                      </select>
                    </td>
                  </tr>

                  {/* Conditional Bank Details */}
                  {formData.payment_method === "Bank" && (
                    <>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50/50">
                          Bank Name
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input
                            type="text"
                            name="bank_name"
                            value={formData.bank_name}
                            onChange={handleInputChange}
                            placeholder="e.g. BRAC Bank"
                            className="w-full bg-white border border-blue-200 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-400 outline-none"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50/50">
                          Account No
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input
                            type="text"
                            name="bank_account_no"
                            value={formData.bank_account_no}
                            onChange={handleInputChange}
                            placeholder="Account Number"
                            className="w-full bg-white border border-blue-200 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-400 outline-none"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50/50">
                          Cheque No.
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input
                            type="text"
                            name="cheque_number"
                            value={formData.cheque_number}
                            onChange={handleInputChange}
                            placeholder="Cheque Number (Optional)"
                            className="w-full bg-white border border-blue-200 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-400 outline-none"
                          />
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Conditional MFS Details */}
                  {formData.payment_method === "MFS" && (
                    <>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-purple-700 bg-purple-50/50">
                          Provider
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <select
                            name="mfs_provider"
                            value={formData.mfs_provider}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-purple-200 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-purple-400 outline-none"
                          >
                            <option value="">Select...</option>
                            <option value="bKash">bKash</option>
                            <option value="Nagad">Nagad</option>
                            <option value="Rocket">Rocket</option>
                            <option value="Upay">Upay</option>
                            <option value="Other">Other</option>
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-purple-700 bg-purple-50/50">
                          Phone No
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input
                            type="text"
                            name="mfs_phone_number"
                            value={formData.mfs_phone_number}
                            onChange={handleInputChange}
                            placeholder="+880..."
                            className="w-full bg-white border border-purple-200 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-purple-400 outline-none"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-purple-700 bg-purple-50/50">
                          TrxID
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input
                            type="text"
                            name="mfs_transaction_id"
                            value={formData.mfs_transaction_id}
                            onChange={handleInputChange}
                            placeholder="Transaction ID"
                            className="w-full bg-white border border-purple-200 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-purple-400 outline-none"
                          />
                        </td>
                      </tr>
                    </>
                  )}

                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50">
                      Remarks
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        placeholder="Optional notes"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  <FiSave />
                  {isSubmitting ? "Saving..." : "Record Capital"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Transaction History Table */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-300 overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-300 px-3 py-1.5 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiList className="text-blue-600" />
                Transaction History
              </h2>
              <span className="text-xs text-gray-500">
                {entries.length} record{entries.length !== 1 && "s"}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider">
                      ID / Date
                    </th>
                    <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider">
                      Category
                    </th>
                    <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider">
                      Source & Payment
                    </th>
                    <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-right">
                      Amount
                    </th>
                    <th className="border border-gray-600 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="border border-gray-300 px-3 py-6 text-center text-gray-400 text-sm">
                        No capital records found.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry, index) => (
                      <tr
                        key={entry.id}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="border border-gray-300 px-2 py-1.5 align-top">
                          <div className="font-medium text-gray-800 text-xs">
                            {entry.capital_id}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {new Date(entry.transaction_date).toLocaleDateString(
                              "en-BD",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-2 py-1.5">
                          <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-800 border border-gray-300 rounded text-[10px] font-medium">
                            {entry.category_name}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-2 py-1.5 max-w-[200px]">
                          <div className="font-medium text-gray-800 truncate">
                            {entry.source_name}
                          </div>
                          <div className="flex flex-wrap items-center gap-1 mt-0.5">
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-sm font-semibold border ${
                                entry.payment_method === "Cash"
                                  ? "bg-green-100 text-green-800 border-green-300"
                                  : entry.payment_method === "Bank"
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : "bg-purple-100 text-purple-800 border-purple-300"
                              }`}
                            >
                              {entry.payment_method}
                            </span>
                            {entry.payment_method === "Bank" && (
                              <span className="text-[9px] text-gray-600 truncate">
                                {entry.bank_name}{" "}
                                {entry.cheque_number && `(Chq: ${entry.cheque_number})`}
                              </span>
                            )}
                            {entry.payment_method === "MFS" && (
                              <span className="text-[9px] text-gray-600 truncate">
                                {entry.mfs_provider}{" "}
                                {entry.mfs_transaction_id &&
                                  `(Trx: ${entry.mfs_transaction_id})`}
                              </span>
                            )}
                          </div>
                          {entry.remarks && (
                            <div className="text-[9px] text-gray-400 truncate italic mt-0.5">
                              “{entry.remarks}”
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 py-1.5 font-mono font-bold text-gray-800 text-right">
                          ৳ {Number(entry.amount).toLocaleString()}
                        </td>
                        <td className="border border-gray-300 px-2 py-1.5 text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => openViewModal(entry)}
                              className="text-blue-600 hover:text-blue-800 transition p-0.5"
                              title="View Details"
                            >
                              <FiEye size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              className="text-gray-400 hover:text-red-600 transition p-0.5"
                              title="Delete Record"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>
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

      {/* --- MODALS --- */}

      {/* Add Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 w-full max-w-md overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FiTag className="text-blue-600" />
                Add New Category
              </h3>
              <button
                onClick={() => setShowCatModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleCatSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={catFormData.name}
                  onChange={handleCatInputChange}
                  placeholder="e.g. Director Loan"
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  Description
                </label>
                <textarea
                  name="description"
                  value={catFormData.description}
                  onChange={handleCatInputChange}
                  rows="3"
                  className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  placeholder="Additional rules or terms..."
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Categories Modal */}
      {showCatListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 w-full max-w-xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FiTag className="text-blue-600" />
                Capital Categories
              </h3>
              <button
                onClick={() => setShowCatListModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-gray-800 text-white sticky top-0">
                  <tr>
                    <th className="border border-gray-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider">
                      Name
                    </th>
                    <th className="border border-gray-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="border border-gray-300 px-3 py-4 text-center text-gray-400">
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-1.5 font-medium text-gray-800">
                          {cat.name}
                        </td>
                        <td className="border border-gray-300 px-3 py-1.5 text-gray-600 text-xs break-words whitespace-normal">
                          {cat.description || "—"}
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

      {/* View Transaction Modal */}
      {showViewModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FiInfo className="text-blue-600" />
                Transaction Details
                <span className="text-xs font-normal text-gray-500 ml-2">
                  #{selectedEntry.capital_id}
                </span>
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              <table className="w-full border-collapse text-sm">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-600 bg-gray-50 w-1/3">
                      Category
                    </td>
                    <td className="border border-gray-300 px-3 py-2">{selectedEntry.category_name}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-600 bg-gray-50">
                      Source / Lender
                    </td>
                    <td className="border border-gray-300 px-3 py-2">{selectedEntry.source_name}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-600 bg-gray-50">
                      Amount
                    </td>
                    <td className="border border-gray-300 px-3 py-2 font-mono font-bold">
                      ৳ {Number(selectedEntry.amount).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-600 bg-gray-50">
                      Date
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {new Date(selectedEntry.transaction_date).toLocaleDateString(
                        "en-BD",
                        { day: "2-digit", month: "long", year: "numeric" }
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-600 bg-gray-50">
                      Payment Method
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          selectedEntry.payment_method === "Cash"
                            ? "bg-green-100 text-green-800"
                            : selectedEntry.payment_method === "Bank"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {selectedEntry.payment_method}
                      </span>
                    </td>
                  </tr>

                  {/* Bank Details */}
                  {selectedEntry.payment_method === "Bank" && (
                    <>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-blue-700 bg-blue-50/50">
                          Bank Name
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {selectedEntry.bank_name || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-blue-700 bg-blue-50/50">
                          Account No
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {selectedEntry.bank_account_no || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-blue-700 bg-blue-50/50">
                          Cheque Number
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {selectedEntry.cheque_number || "—"}
                        </td>
                      </tr>
                    </>
                  )}

                  {/* MFS Details */}
                  {selectedEntry.payment_method === "MFS" && (
                    <>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-purple-700 bg-purple-50/50">
                          Provider
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {selectedEntry.mfs_provider || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-purple-700 bg-purple-50/50">
                          Phone Number
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {selectedEntry.mfs_phone_number || "—"}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-purple-700 bg-purple-50/50">
                          Transaction ID
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {selectedEntry.mfs_transaction_id || "—"}
                        </td>
                      </tr>
                    </>
                  )}

                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-600 bg-gray-50">
                      Remarks
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {selectedEntry.remarks || "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-right">
              <button
                onClick={() => setShowViewModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-4 py-1.5 rounded text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}