import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../../api/axios";
import {
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiX,
  FiDollarSign,
  FiSave,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiList,
} from "react-icons/fi";

// Reusable Detail Row for View Modal
const DetailRow = ({ label, value }) => (
  <div className="flex justify-between border-b border-gray-100 py-2">
    <span className="text-gray-500 text-xs font-semibold">{label}</span>
    <span className="text-gray-800 text-sm text-right">{value || "N/A"}</span>
  </div>
);

// Constants for Form
const MAIN_CATEGORIES = ['Salary', 'Operational', 'Loan', 'Asset', 'Others'];
const SUB_CATEGORIES = {
  'Salary': ['Basic Pay', 'Overtime', 'Bonus', 'Advance Salary'],
  'Operational': ['Rent', 'Utility', 'Office Supplies', 'Entertainment', 'Transportation', 'Maintenance', 'Marketing'],
  'Loan': ['Bank EMI', 'Private Loan'],
  'Asset': ['Furniture', 'IT Equipment', 'Tools'],
  'Others': ['Miscellaneous', 'Donation', 'Fines']
};
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'bKash', 'Nagad', 'Rocket', 'Cheque'];

const initialFormState = {
  id: null,
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
};

export default function ExpenseList() {
  // --- STATE ---
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modals State
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  // Form State
  const [formData, setFormData] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // --- LIFECYCLE ---
  useEffect(() => {
    fetchExpenses();
    fetchEmployees();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await axiosInstance.get("expense/expenses/");
      const data = response.data.results ? response.data.results : response.data;
      setExpenses(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError("Failed to load expenses. Is the server running?");
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get("person/employees/");
      setEmployees(response.data.results ? response.data.results : response.data);
    } catch (err) {
      console.error("Failed to load employees", err);
    }
  };

  // --- ACTIONS ---
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this expense record?")) {
      try {
        await axiosInstance.delete(`expense/expenses/${id}/`);
        setExpenses(expenses.filter(exp => exp.id !== id));
      } catch (err) {
        alert("Error deleting expense.");
      }
    }
  };

  // --- MODAL CONTROLS ---
  const openAddModal = () => {
    setModalMode("add");
    setFormData(initialFormState);
    setFormError("");
    setIsFormModalOpen(true);
  };

  const openEditModal = (expense) => {
    setModalMode("edit");
    setFormData({
      id: expense.id,
      main_category: expense.main_category || "Operational",
      sub_category: expense.sub_category || "",
      amount: expense.amount || "",
      payment_method: expense.payment_method || "Cash",
      transaction_id: expense.transaction_id || "",
      remarks: expense.remarks || "",
      employee_recipient: expense.employee_recipient || "",
      salary_month: expense.salary_month || "",
      bank_name: expense.bank_name || "",
      account_name: expense.account_name || "",
      account_no: expense.account_no || "",
      branch_name: expense.branch_name || "",
      mfs_number: expense.mfs_number || "",
    });
    setFormError("");
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setFormData(initialFormState);
  };

  // --- FORM HANDLERS ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "main_category") {
      setFormData({
        ...formData,
        main_category: value,
        sub_category: SUB_CATEGORIES[value]?.[0] || "",
        employee_recipient: value !== 'Salary' ? "" : formData.employee_recipient,
        salary_month: value !== 'Salary' ? "" : formData.salary_month,
      });
    } else if (name === "payment_method") {
      setFormData({
        ...formData,
        payment_method: value,
        transaction_id: value === 'Cash' ? "" : formData.transaction_id,
        bank_name: (value !== 'Bank Transfer' && value !== 'Cheque') ? "" : formData.bank_name,
        account_name: (value !== 'Bank Transfer' && value !== 'Cheque') ? "" : formData.account_name,
        account_no: (value !== 'Bank Transfer' && value !== 'Cheque') ? "" : formData.account_no,
        branch_name: (value !== 'Bank Transfer' && value !== 'Cheque') ? "" : formData.branch_name,
        mfs_number: !['bKash', 'Nagad', 'Rocket'].includes(value) ? "" : formData.mfs_number,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    if (!formData.amount || formData.amount <= 0) {
      setFormError("Please enter a valid amount.");
      setFormLoading(false);
      return;
    }
    if (formData.main_category === 'Salary' && !formData.employee_recipient) {
      setFormError("Please select an employee for salary.");
      setFormLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        employee_recipient: formData.employee_recipient || null,
        salary_month: formData.salary_month || null,
      };

      if (modalMode === 'edit') {
        await axiosInstance.put(`expense/expenses/${formData.id}/`, payload);
      } else {
        await axiosInstance.post("expense/expenses/", payload);
      }
      
      await fetchExpenses();
      closeFormModal();
    } catch (err) {
      setFormError(err.response?.data?.detail || "Failed to save expense.");
    } finally {
      setFormLoading(false);
    }
  };

  // --- STATS ---
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    const count = expenses.length;
    const latest =
      expenses.length > 0
        ? expenses.reduce((latest, e) =>
            new Date(e.expense_date) > new Date(latest.expense_date) ? e : latest
          ).expense_date
        : null;
    return { total, count, latest };
  }, [expenses]);

  // --- FILTER ---
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.expense_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.sub_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.main_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "ALL" || exp.main_category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // --- GROUP FILTERED EXPENSES BY CATEGORY ---
  const groupedFiltered = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      const category = expense.main_category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(expense);
      return acc;
    }, {});
  }, [filteredExpenses]);

  const isBank = formData.payment_method === 'Bank Transfer' || formData.payment_method === 'Cheque';
  const isMFS = ['bKash', 'Nagad', 'Rocket'].includes(formData.payment_method);

  if (loading) return <div className="p-4 text-gray-600 text-center text-sm font-semibold">Loading Expense Ledger...</div>;

  return (
    <div className="max-w-7xl mx-auto p-3 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FiDollarSign className="text-blue-600" /> Expense Ledger
          </h1>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-semibold transition flex items-center gap-1.5 border border-blue-700"
        >
          <FiPlus /> Record Expense
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border border-gray-300 mb-4 bg-white">
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiDollarSign className="text-blue-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Total Expenses
            </p>
            <p className="text-lg font-bold text-gray-800">
              ৳ {stats.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="p-2 border-r border-gray-300 flex items-center gap-2">
          <FiList className="text-indigo-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Records
            </p>
            <p className="text-lg font-bold text-gray-800">{stats.count}</p>
          </div>
        </div>
        <div className="p-2 flex items-center gap-2">
          <FiCalendar className="text-purple-600 text-lg" />
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              Latest Expense
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

      {/* Main Card */}
      <div className="bg-white border border-gray-300 overflow-hidden">
        {/* Filter / Search Bar */}
        <div className="border-b border-gray-300 px-3 py-1.5 bg-gray-50 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search by ID, Category, Sub-Category, Method, or Remarks..."
              className="w-full pl-7 pr-2 py-1 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1 w-full sm:w-auto">
            <FiFilter className="text-gray-400 shrink-0" size={14} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto bg-white border border-gray-300 rounded py-1 px-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="ALL">All Categories</option>
              {MAIN_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 text-center text-red-500 text-sm border-b border-gray-200">{error}</div>
        )}

        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No expenses match your criteria.</div>
        ) : (
          // --- SIDE-BY-SIDE CATEGORY TABLES (2 columns) ---
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {Object.entries(groupedFiltered).map(([category, catExpenses]) => (
              <div key={category} className="border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
                {/* Category Header */}
                <div className="bg-gray-800 text-white px-3 py-2 flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider">{category}</h3>
                  <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    {catExpenses.length}
                  </span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-[10px] font-bold border-b border-gray-200">
                        <th className="px-2 py-1.5 text-left">Date</th>
                        <th className="px-2 py-1.5 text-left">ID</th>
                        <th className="px-2 py-1.5 text-left">Sub-Category</th>
                        <th className="px-2 py-1.5 text-right">Amount</th>
                        <th className="px-2 py-1.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catExpenses.map((expense, idx) => (
                        <tr key={expense.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                          <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap">
                            {expense.expense_date
                              ? new Date(expense.expense_date).toLocaleDateString("en-BD", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="px-2 py-1.5 font-mono text-gray-800 font-bold">
                            {expense.expense_id ? expense.expense_id.replace("EXP-", "") : "—"}
                          </td>
                          <td className="px-2 py-1.5 text-gray-700">
                            {expense.sub_category}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono font-bold text-red-600">
                            ৳ {parseFloat(expense.amount).toFixed(2)}
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <div className="flex justify-center items-center gap-0.5">
                              <button
                                onClick={() => setSelectedExpense(expense)}
                                className="text-blue-600 hover:text-blue-800 p-0.5"
                                title="View"
                              >
                                <FiEye size={14} />
                              </button>
                              <button
                                onClick={() => openEditModal(expense)}
                                className="text-amber-600 hover:text-amber-800 p-0.5"
                                title="Edit"
                              >
                                <FiEdit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(expense.id)}
                                className="text-gray-400 hover:text-red-600 p-0.5"
                                title="Delete"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- VIEW DETAILS MODAL (unchanged) --- */}
      {selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-3">
          <div className="bg-white border border-gray-300 w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden rounded-lg">
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex justify-between items-center shrink-0">
              <div>
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <FiDollarSign className="text-blue-600" /> {selectedExpense.expense_id}
                </h2>
                <p className="text-[10px] text-gray-500">Expense details</p>
              </div>
              <button onClick={() => setSelectedExpense(null)} className="text-gray-500 hover:text-red-500">
                <FiX size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              <div className="bg-gradient-to-br from-red-50 to-white rounded-lg p-4 border border-red-100 text-center">
                <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider">Amount</p>
                <p className="text-2xl font-black text-red-600">
                  ৳ {parseFloat(selectedExpense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="space-y-1 bg-white border border-gray-100 rounded-lg p-3">
                <DetailRow label="Date" value={new Date(selectedExpense.expense_date).toLocaleString()} />
                <DetailRow label="Category" value={`${selectedExpense.main_category} > ${selectedExpense.sub_category}`} />
                {selectedExpense.main_category === 'Salary' && (
                  <>
                    <DetailRow label="Employee" value={selectedExpense.employee_recipient_name} />
                    <DetailRow label="Salary Month" value={selectedExpense.salary_month} />
                  </>
                )}
                <DetailRow label="Payment Method" value={selectedExpense.payment_method} />
                {selectedExpense.payment_method !== 'Cash' && (
                  <DetailRow label="Txn/Cheque ID" value={selectedExpense.transaction_id} />
                )}
                <DetailRow label="Recorded By" value={selectedExpense.entry_by_name || "System/Admin"} />
              </div>
              {selectedExpense.remarks && (
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Remarks</p>
                  <div className="bg-amber-50 p-2 rounded border border-amber-200 text-amber-800 text-sm">
                    {selectedExpense.remarks}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 flex justify-end shrink-0">
              <button onClick={() => setSelectedExpense(null)} className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-200 border border-gray-300">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- FORM MODAL (ADD / EDIT) – unchanged --- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-3">
          <div className="bg-white border border-gray-300 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-lg">
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex justify-between items-center shrink-0">
              <div>
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <FiDollarSign className="text-blue-600" />{" "}
                  {modalMode === 'add' ? 'Record New Expense' : 'Edit Expense Record'}
                </h2>
                <p className="text-[10px] text-gray-500">Fill in the details below</p>
              </div>
              <button onClick={closeFormModal} className="text-gray-500 hover:text-red-500">
                <FiX size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {formError && (
                <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                  {formError}
                </div>
              )}
              <form id="expenseForm" onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                      Main Category *
                    </label>
                    <select
                      name="main_category"
                      value={formData.main_category}
                      onChange={handleFormChange}
                      required
                      className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      {MAIN_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                      Sub Category *
                    </label>
                    <select
                      name="sub_category"
                      value={formData.sub_category}
                      onChange={handleFormChange}
                      required
                      className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      {SUB_CATEGORIES[formData.main_category]?.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.main_category === 'Salary' && (
                  <div className="bg-blue-50/50 border border-blue-200 p-3 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-blue-800 uppercase tracking-wider mb-0.5">
                        Employee *
                      </label>
                      <select
                        name="employee_recipient"
                        value={formData.employee_recipient}
                        onChange={handleFormChange}
                        required
                        className="w-full bg-white border border-blue-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      >
                        <option value="">-- Choose Employee --</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} (ID: {emp.employee_id})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-blue-800 uppercase tracking-wider mb-0.5">
                        Salary Month
                      </label>
                      <input
                        type="date"
                        name="salary_month"
                        value={formData.salary_month}
                        onChange={handleFormChange}
                        className="w-full bg-white border border-blue-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                      Payment Method *
                    </label>
                    <select
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleFormChange}
                      required
                      className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                      Amount (৳) *
                    </label>
                    <input
                      type="number"
                      step="1"
                      name="amount"
                      value={formData.amount}
                      onChange={handleFormChange}
                      required
                      placeholder="0.00"
                      className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm font-bold text-blue-700 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {isMFS && (
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                      {formData.payment_method} Number
                    </label>
                    <input
                      type="text"
                      name="mfs_number"
                      value={formData.mfs_number}
                      onChange={handleFormChange}
                      placeholder="e.g. 017..."
                      className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className={`block text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${formData.payment_method === 'Cash' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Txn/Cheque ID {formData.payment_method !== 'Cash' && '*'}
                  </label>
                  <input
                    type="text"
                    name="transaction_id"
                    value={formData.transaction_id}
                    onChange={handleFormChange}
                    disabled={formData.payment_method === 'Cash'}
                    required={formData.payment_method !== 'Cash'}
                    placeholder={formData.payment_method === 'Cash' ? "N/A for Cash" : "Enter ID"}
                    className={`w-full border rounded p-1.5 text-sm outline-none transition ${
                      formData.payment_method === 'Cash'
                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 bg-white focus:ring-1 focus:ring-blue-500'
                    }`}
                  />
                </div>

                {isBank && (
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bank_name"
                        value={formData.bank_name}
                        onChange={handleFormChange}
                        className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="City Bank"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                        Account Name
                      </label>
                      <input
                        type="text"
                        name="account_name"
                        value={formData.account_name}
                        onChange={handleFormChange}
                        className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="Holder Name"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                        Account No.
                      </label>
                      <input
                        type="text"
                        name="account_no"
                        value={formData.account_no}
                        onChange={handleFormChange}
                        className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                        Branch
                      </label>
                      <input
                        type="text"
                        name="branch_name"
                        value={formData.branch_name}
                        onChange={handleFormChange}
                        className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        placeholder="Branch"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                    Remarks / Note
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleFormChange}
                    rows="2"
                    placeholder="Add specific details..."
                    className="w-full bg-white border border-gray-300 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              </form>
            </div>
            <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={closeFormModal}
                className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-200 border border-gray-300"
              >
                Cancel
              </button>
              <button
                form="expenseForm"
                type="submit"
                disabled={formLoading}
                className={`px-4 py-1.5 rounded text-sm font-bold text-white transition flex items-center gap-1.5 ${
                  formLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                <FiSave /> {formLoading ? "Saving..." : "Save Expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}