import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import {
  FiSave,
  FiArrowLeft,
  FiDollarSign,
  FiList,
  FiEye,
  FiTrash2,
  FiX,
  FiCalendar,
} from "react-icons/fi";

export default function AddExpense() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);

  // Dropdown Options
  const [employees, setEmployees] = useState([]);

  // Explicitly defined categories
  const MAIN_CATEGORIES = ["Salary", "Operational", "Loan", "Asset", "Others"];
  const SUB_CATEGORIES = {
    Salary: ["Basic Pay", "Overtime", "Bonus", "Advance Salary"],
    Operational: [
      "Rent",
      "Utility",
      "Office Supplies",
      "Entertainment",
      "Transportation",
      "Maintenance",
      "Marketing",
    ],
    Loan: ["Bank EMI", "Private Loan"],
    Asset: ["Furniture", "IT Equipment", "Tools"],
    Others: ["Miscellaneous", "Donation", "Fines"],
  };
  const PAYMENT_METHODS = ["Cash", "Bank Transfer", "bKash", "Nagad", "Rocket", "Cheque"];

  // Form state
  const [formData, setFormData] = useState({
    main_category: "Operational",
    sub_category: "Utility",
    amount: "",
    payment_method: "Cash",
    transaction_id: "",
    remarks: "",
    employee_recipient: "",
    salary_month: "",
    bank_name: "",
    account_name: "",
    account_no: "",
    branch_name: "",
    mfs_number: "",
  });

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Fetch employees and expenses on load
  useEffect(() => {
    fetchEmployees();
    fetchExpenses();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get("person/employees/");
      setEmployees(response.data.results ? response.data.results : response.data);
    } catch (err) {
      console.error("Failed to load employees", err);
    }
  };

  const fetchExpenses = async () => {
    try {
      setExpensesLoading(true);
      const response = await axiosInstance.get("expense/expenses/");
      setExpenses(response.data.results ? response.data.results : response.data);
    } catch (err) {
      console.error("Failed to load expenses", err);
    } finally {
      setExpensesLoading(false);
    }
  };

  // Compute stats
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const count = expenses.length;
    const latest =
      expenses.length > 0
        ? expenses.reduce((latest, e) =>
            new Date(e.created_at) > new Date(latest.created_at) ? e : latest
          ).created_at
        : null;
    return { total, count, latest };
  }, [expenses]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "main_category") {
      setFormData({
        ...formData,
        main_category: value,
        sub_category: SUB_CATEGORIES[value][0] || "",
        employee_recipient: value !== "Salary" ? "" : formData.employee_recipient,
        salary_month: value !== "Salary" ? "" : formData.salary_month,
      });
    } else if (name === "payment_method") {
      setFormData({
        ...formData,
        payment_method: value,
        transaction_id: value === "Cash" ? "" : formData.transaction_id,
        bank_name:
          value !== "Bank Transfer" && value !== "Cheque" ? "" : formData.bank_name,
        account_name:
          value !== "Bank Transfer" && value !== "Cheque" ? "" : formData.account_name,
        account_no:
          value !== "Bank Transfer" && value !== "Cheque" ? "" : formData.account_no,
        branch_name:
          value !== "Bank Transfer" && value !== "Cheque" ? "" : formData.branch_name,
        mfs_number: !["bKash", "Nagad", "Rocket"].includes(value)
          ? ""
          : formData.mfs_number,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.amount || formData.amount <= 0) {
      setError("Please enter a valid amount.");
      setLoading(false);
      return;
    }
    if (formData.main_category === "Salary" && !formData.employee_recipient) {
      setError("Please select which employee is receiving this salary.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        employee_recipient: formData.employee_recipient || null,
        salary_month: formData.salary_month || null,
      };

      await axiosInstance.post("expense/expenses/", payload);
      // Reset form
      setFormData({
        ...formData,
        amount: "",
        transaction_id: "",
        remarks: "",
        employee_recipient: "",
        salary_month: "",
        bank_name: "",
        account_name: "",
        account_no: "",
        branch_name: "",
        mfs_number: "",
      });
      fetchExpenses(); // refresh list
    } catch (err) {
      console.error("Submission error:", err.response?.data);
      setError(err.response?.data?.detail || "Failed to save expense.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this expense record permanently?")) {
      try {
        await axiosInstance.delete(`expense/expenses/${id}/`);
        fetchExpenses();
      } catch (err) {
        alert("Failed to delete record.");
      }
    }
  };

  const openViewModal = (expense) => {
    setSelectedExpense(expense);
    setShowViewModal(true);
  };

  const isBank =
    formData.payment_method === "Bank Transfer" || formData.payment_method === "Cheque";
  const isMFS = ["bKash", "Nagad", "Rocket"].includes(formData.payment_method);

  // Helper to get employee name from ID
  const getEmployeeName = (id) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? emp.name : "—";
  };

  return (
    <div className="max-w-7xl mx-auto p-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded border border-gray-300"
          >
            <FiArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FiDollarSign className="text-blue-600" /> Expense Management
          </h1>
        </div>
      </div>

      {/* Stats Row - Compact bordered */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border border-gray-300 mb-4 bg-white">
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiDollarSign className="text-blue-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Expenses
            </p>
            <p className="text-lg font-bold text-gray-800">
              ৳ {stats.total.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiList className="text-indigo-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Entries
            </p>
            <p className="text-lg font-bold text-gray-800">{stats.count}</p>
          </div>
        </div>
        <div className="p-2 flex items-center gap-2">
          <FiCalendar className="text-purple-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Latest Entry
            </p>
            <p className="text-sm font-semibold text-gray-700">
              {stats.latest
                ? new Date(stats.latest).toLocaleDateString("en-BD", {
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

      {/* Main Grid: Form + History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* --- FORM CARD (Table Layout) --- */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-300 overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-300 px-3 py-1.5 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiSave className="text-blue-600" />
                New Expense Entry
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-3">
              <table className="w-full border-collapse">
                <tbody>
                  {/* Main Category */}
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50 w-1/3">
                      Main Category
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <select
                        name="main_category"
                        value={formData.main_category}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        {MAIN_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {/* Sub Category */}
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50">
                      Sub Category
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <select
                        name="sub_category"
                        value={formData.sub_category}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        {SUB_CATEGORIES[formData.main_category]?.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>

                  {/* Salary Details (conditional) */}
                  {formData.main_category === "Salary" && (
                    <>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50/50">
                          Employee *
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <select
                            name="employee_recipient"
                            value={formData.employee_recipient}
                            onChange={handleChange}
                            required
                            className="w-full bg-white border border-blue-200 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-400 outline-none"
                          >
                            <option value="">— Choose —</option>
                            {employees.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.name} (ID: {emp.employee_id})
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50/50">
                          Salary Month
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input
                            type="date"
                            name="salary_month"
                            value={formData.salary_month}
                            onChange={handleChange}
                            className="w-full bg-white border border-blue-200 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-400 outline-none"
                          />
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Payment Method */}
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50">
                      Payment Method
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <select
                        name="payment_method"
                        value={formData.payment_method}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>

                  {/* Amount */}
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50">
                      Amount (৳)
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="number"
                        step="0.01"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        placeholder="0.00"
                        className="w-full bg-white border border-gray-300 rounded p-1 text-sm font-mono font-bold text-blue-700 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </td>
                  </tr>

                  {/* Transaction ID */}
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50">
                      {formData.payment_method === "Cash" ? "Txn ID" : "Txn/Cheque ID *"}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <input
                        type="text"
                        name="transaction_id"
                        value={formData.transaction_id}
                        onChange={handleChange}
                        disabled={formData.payment_method === "Cash"}
                        required={formData.payment_method !== "Cash"}
                        placeholder={
                          formData.payment_method === "Cash" ? "Not required" : "Enter ID"
                        }
                        className={`w-full border rounded p-1 text-sm outline-none transition ${
                          formData.payment_method === "Cash"
                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        }`}
                      />
                    </td>
                  </tr>

                  {/* MFS Number (conditional) */}
                  {isMFS && (
                    <tr>
                      <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-purple-700 bg-purple-50/50">
                        {formData.payment_method} Number
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <input
                          type="text"
                          name="mfs_number"
                          value={formData.mfs_number}
                          onChange={handleChange}
                          placeholder="e.g. 017..."
                          className="w-full bg-white border border-purple-200 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-purple-400 outline-none"
                        />
                      </td>
                    </tr>
                  )}

                  {/* Bank Details (conditional) */}
                  {isBank && (
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
                            onChange={handleChange}
                            placeholder="e.g. City Bank"
                            className="w-full bg-white border border-blue-200 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-400 outline-none"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50/50">
                          Account Name
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input
                            type="text"
                            name="account_name"
                            value={formData.account_name}
                            onChange={handleChange}
                            placeholder="Account Holder"
                            className="w-full bg-white border border-blue-200 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-400 outline-none"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50/50">
                          Account No.
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input
                            type="text"
                            name="account_no"
                            value={formData.account_no}
                            onChange={handleChange}
                            placeholder="123456789"
                            className="w-full bg-white border border-blue-200 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-400 outline-none"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50/50">
                          Branch
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          <input
                            type="text"
                            name="branch_name"
                            value={formData.branch_name}
                            onChange={handleChange}
                            placeholder="Branch Name"
                            className="w-full bg-white border border-blue-200 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-400 outline-none"
                          />
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Remarks */}
                  <tr>
                    <td className="border border-gray-300 px-2 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50">
                      Remarks
                    </td>
                    <td className="border border-gray-300 px-2 py-1">
                      <textarea
                        name="remarks"
                        value={formData.remarks}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Optional notes"
                        className="w-full bg-white border border-gray-300 rounded p-1 text-sm text-gray-800 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded text-sm transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  <FiSave />
                  {loading ? "Recording..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* --- HISTORY TABLE --- */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-300 overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-300 px-3 py-1.5 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiList className="text-blue-600" />
                Expense History
              </h2>
              <span className="text-xs text-gray-500">
                {expenses.length} record{expenses.length !== 1 && "s"}
              </span>
            </div>
            {expensesLoading ? (
              <div className="p-4 text-center text-gray-400">Loading expenses...</div>
            ) : (
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
                        Details
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
                    {expenses.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="border border-gray-300 px-3 py-6 text-center text-gray-400 text-sm"
                        >
                          No expense records found.
                        </td>
                      </tr>
                    ) : (
                      expenses.map((exp, index) => (
                        <tr
                          key={exp.id}
                          className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="border border-gray-300 px-2 py-1.5 align-top">
                            <div className="font-medium text-gray-800 text-xs">
                              {exp.expense_id || `#${exp.id}`}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {new Date(exp.created_at).toLocaleDateString("en-BD", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </td>
                          <td className="border border-gray-300 px-2 py-1.5">
                            <div className="text-xs font-medium text-gray-800">
                              {exp.main_category}
                            </div>
                            <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-800 border border-gray-300 rounded text-[10px] font-medium">
                              {exp.sub_category}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-2 py-1.5 max-w-[200px]">
                            <div className="font-medium text-gray-800 truncate">
                              {exp.main_category === "Salary"
                                ? getEmployeeName(exp.employee_recipient)
                                : exp.payment_method}
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mt-0.5">
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-sm font-semibold border ${
                                  exp.payment_method === "Cash"
                                    ? "bg-green-100 text-green-800 border-green-300"
                                    : exp.payment_method === "Bank Transfer" ||
                                      exp.payment_method === "Cheque"
                                    ? "bg-blue-100 text-blue-800 border-blue-300"
                                    : "bg-purple-100 text-purple-800 border-purple-300"
                                }`}
                              >
                                {exp.payment_method}
                              </span>
                              {exp.transaction_id && (
                                <span className="text-[9px] text-gray-600">
                                  {exp.transaction_id}
                                </span>
                              )}
                            </div>
                            {exp.remarks && (
                              <div className="text-[9px] text-gray-400 truncate italic mt-0.5">
                                “{exp.remarks}”
                              </div>
                            )}
                          </td>
                          <td className="border border-gray-300 px-2 py-1.5 font-mono font-bold text-gray-800 text-right">
                            ৳ {Number(exp.amount).toLocaleString()}
                          </td>
                          <td className="border border-gray-300 px-2 py-1.5 text-center">
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => openViewModal(exp)}
                                className="text-blue-600 hover:text-blue-800 transition p-0.5"
                                title="View Details"
                              >
                                <FiEye size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(exp.id)}
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
            )}
          </div>
        </div>
      </div>

      {/* --- VIEW MODAL (FIXED) --- */}
      {showViewModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-300 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FiEye className="text-blue-600" />
                Expense Details
                <span className="text-xs font-normal text-gray-500 ml-2">
                  #{selectedExpense.expense_id || selectedExpense.id}
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
                    <td className="border border-gray-300 px-3 py-2">
                      {selectedExpense.main_category} → {selectedExpense.sub_category}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-600 bg-gray-50">
                      Amount
                    </td>
                    <td className="border border-gray-300 px-3 py-2 font-mono font-bold">
                      ৳ {Number(selectedExpense.amount).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-600 bg-gray-50">
                      Date
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {new Date(selectedExpense.created_at).toLocaleDateString(
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
                          selectedExpense.payment_method === "Cash"
                            ? "bg-green-100 text-green-800"
                            : selectedExpense.payment_method === "Bank Transfer" ||
                              selectedExpense.payment_method === "Cheque"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {selectedExpense.payment_method}
                      </span>
                    </td>
                  </tr>
                  {selectedExpense.transaction_id && (
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-600 bg-gray-50">
                        Transaction ID
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {selectedExpense.transaction_id}
                      </td>
                    </tr>
                  )}

                  {/* Salary specific – always show if category is Salary */}
                  {selectedExpense.main_category === "Salary" && (
                    <>
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 font-semibold text-blue-700 bg-blue-50/50">
                          Employee
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {getEmployeeName(selectedExpense.employee_recipient)}
                        </td>
                      </tr>
                      {selectedExpense.salary_month && (
                        <tr>
                          <td className="border border-gray-300 px-3 py-2 font-semibold text-blue-700 bg-blue-50/50">
                            Salary Month
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            {new Date(selectedExpense.salary_month).toLocaleDateString(
                              "en-BD",
                              { month: "long", year: "numeric" }
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  )}

                  {/* Bank details – always show for Bank Transfer or Cheque */}
                  {["Bank Transfer", "Cheque"].includes(selectedExpense.payment_method) && (
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-semibold text-blue-700 bg-blue-50/50">
                        Bank Details
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <div><span className="font-medium">Bank:</span> {selectedExpense.bank_name || "—"}</div>
                        <div><span className="font-medium">Account Name:</span> {selectedExpense.account_name || "—"}</div>
                        <div><span className="font-medium">Account No:</span> {selectedExpense.account_no || "—"}</div>
                        <div><span className="font-medium">Branch:</span> {selectedExpense.branch_name || "—"}</div>
                      </td>
                    </tr>
                  )}

                  {/* MFS details – always show for bKash/Nagad/Rocket */}
                  {["bKash", "Nagad", "Rocket"].includes(selectedExpense.payment_method) && (
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 font-semibold text-purple-700 bg-purple-50/50">
                        MFS Number
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        {selectedExpense.mfs_number || "—"}
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-semibold text-gray-600 bg-gray-50">
                      Remarks
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {selectedExpense.remarks || "—"}
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