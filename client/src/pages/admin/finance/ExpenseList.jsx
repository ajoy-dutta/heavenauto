import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../../../api/axios";
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiX, FiDollarSign, FiSave } from "react-icons/fi";

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
  
  // Modals State
  const [selectedExpense, setSelectedExpense] = useState(null); // For View Details
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  
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
      
      await fetchExpenses(); // Refresh list to get new DB format (like IDs & names)
      closeFormModal();
    } catch (err) {
      setFormError(err.response?.data?.detail || "Failed to save expense.");
    } finally {
      setFormLoading(false);
    }
  };

  // Group expenses
  const groupedExpenses = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      const category = expense.main_category || "Uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(expense);
      return acc;
    }, {});
  }, [expenses]);

  const isBank = formData.payment_method === 'Bank Transfer' || formData.payment_method === 'Cheque';
  const isMFS = ['bKash', 'Nagad', 'Rocket'].includes(formData.payment_method);

  if (loading) return <div className="p-4 text-gray-600 text-center text-sm font-semibold">Loading Expense Ledger...</div>;

  return (
    <div className="p-3 md:p-5 bg-gray-50 min-h-screen text-gray-800">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
            <FiDollarSign className="text-blue-600" /> Expense Ledger
          </h1>
          <p className="text-gray-500 text-xs mt-0.5 font-medium">Categorized view of salaries, operations, and cash outflow.</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-md text-sm transition shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <FiPlus /> Record Expense
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 text-sm rounded mb-4 shadow-sm">{error}</div>}

      {/* Categorized Expense Tables */}
      {expenses.length === 0 ? (
        <div className="bg-white p-10 text-center text-gray-400 rounded-xl border border-gray-200 text-sm shadow-sm font-medium">
          No expenses recorded yet.
        </div>
      ) : (
        Object.entries(groupedExpenses).map(([category, catExpenses]) => (
          <div key={category} className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Category Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-200 flex justify-between items-center">
               <h2 className="font-bold text-gray-800 text-sm tracking-wide">{category} Expenses</h2>
               <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full shadow-sm">
                 {catExpenses.length} Records
               </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50/50 border-b border-gray-100 text-xs text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Sub-Category</th>
                    <th className="px-4 py-3 text-right">Amount (৳)</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {catExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition duration-150">
                      <td className="px-4 py-2.5 whitespace-nowrap text-xs font-medium text-gray-500">{expense.expense_date}</td>
                      <td className="px-4 py-2.5 font-bold text-gray-800 text-xs">{expense.expense_id}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-600">{expense.sub_category}</td>
                      <td className="px-4 py-2.5 text-right font-black text-red-600 text-sm">
                        {parseFloat(expense.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 font-medium">{expense.payment_method}</td>
                      <td className="px-4 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => setSelectedExpense(expense)}
                            className="p-1.5 bg-gray-50 text-gray-600 hover:bg-blue-100 hover:text-blue-700 rounded-md transition" 
                            title="View Details"
                          >
                            <FiEye size={15} />
                          </button>
                          <button 
                            onClick={() => openEditModal(expense)}
                            className="p-1.5 bg-gray-50 text-gray-600 hover:bg-amber-100 hover:text-amber-700 rounded-md transition" 
                            title="Edit"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button 
                            onClick={() => handleDelete(expense.id)}
                            className="p-1.5 bg-gray-50 text-gray-600 hover:bg-red-100 hover:text-red-700 rounded-md transition" 
                            title="Delete"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* --- FORM MODAL (ADD / EDIT) --- */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
                <FiDollarSign className="text-blue-600" /> 
                {modalMode === 'add' ? 'Record New Expense' : 'Edit Expense Record'}
              </h2>
              <button onClick={closeFormModal} className="text-gray-400 hover:text-gray-800 bg-white shadow-sm border border-gray-200 hover:bg-gray-50 p-1.5 rounded-full transition">
                <FiX size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {formError && <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm font-medium">{formError}</div>}

              <form id="expenseForm" onSubmit={handleFormSubmit} className="space-y-6">
                
                {/* Section 1: Categorization */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Main Category *</label>
                    <select
                      name="main_category"
                      value={formData.main_category}
                      onChange={handleFormChange}
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    >
                      {MAIN_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Sub Category *</label>
                    <select
                      name="sub_category"
                      value={formData.sub_category}
                      onChange={handleFormChange}
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    >
                      {SUB_CATEGORIES[formData.main_category]?.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                  </div>
                </div>

                {/* Conditional Salary Details */}
                {formData.main_category === 'Salary' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <div>
                      <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1.5">Select Employee *</label>
                      <select
                        name="employee_recipient"
                        value={formData.employee_recipient}
                        onChange={handleFormChange}
                        required
                        className="w-full border border-blue-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                      >
                        <option value="">-- Choose Employee --</option>
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} (ID: {emp.employee_id})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-blue-800 uppercase tracking-wider mb-1.5">Salary Month</label>
                      <input
                        type="date"
                        name="salary_month"
                        value={formData.salary_month}
                        onChange={handleFormChange}
                        className="w-full border border-blue-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Section 2: Financial Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Method *</label>
                    <select
                      name="payment_method"
                      value={formData.payment_method}
                      onChange={handleFormChange}
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white"
                    >
                      {PAYMENT_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Amount (৳) *</label>
                    <input
                      type="number"
                      step="1"
                      name="amount"
                      value={formData.amount}
                      onChange={handleFormChange}
                      required
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-black text-blue-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white shadow-inner"
                    />
                  </div>

                  {isMFS && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{formData.payment_method} Number</label>
                      <input type="text" name="mfs_number" value={formData.mfs_number} onChange={handleFormChange} placeholder="e.g. 017..." className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white" />
                    </div>
                  )}

                  <div className={isBank ? "lg:col-span-2" : ""}>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${formData.payment_method === 'Cash' ? 'text-gray-400' : 'text-gray-600'}`}>
                      TXN/Cheque ID {formData.payment_method !== 'Cash' && '*'}
                    </label>
                    <input
                      type="text"
                      name="transaction_id"
                      value={formData.transaction_id}
                      onChange={handleFormChange}
                      disabled={formData.payment_method === 'Cash'}
                      required={formData.payment_method !== 'Cash'}
                      placeholder={formData.payment_method === 'Cash' ? "N/A for Cash" : "Enter ID"}
                      className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-all
                        ${formData.payment_method === 'Cash' 
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'border-gray-300 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'}`}
                    />
                  </div>
                </div>

                {/* Conditional Bank Details */}
                {isBank && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Bank Name</label>
                      <input type="text" name="bank_name" value={formData.bank_name} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 outline-none text-sm bg-white" placeholder="City Bank" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Account Name</label>
                      <input type="text" name="account_name" value={formData.account_name} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 outline-none text-sm bg-white" placeholder="Holder Name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Account No.</label>
                      <input type="text" name="account_no" value={formData.account_no} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 outline-none text-sm bg-white" placeholder="123456789" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Branch</label>
                      <input type="text" name="branch_name" value={formData.branch_name} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 outline-none text-sm bg-white" placeholder="Branch" />
                    </div>
                  </div>
                )}

                {/* Section 3: Notes */}
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Remarks / Note</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleFormChange}
                    rows="2"
                    placeholder="Add specific details about this expense..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 focus:bg-white resize-none"
                  />
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex justify-end gap-3">
              <button type="button" onClick={closeFormModal} className="px-5 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-200 transition">
                Cancel
              </button>
              <button type="submit" form="expenseForm" disabled={formLoading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-6 rounded-lg transition shadow-md disabled:opacity-50">
                <FiSave size={16} />
                {formLoading ? "Saving..." : "Save Expense"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- VIEW DETAILS MODAL --- */}
      {selectedExpense && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">Expense Details</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">{selectedExpense.expense_id}</p>
              </div>
              <button onClick={() => setSelectedExpense(null)} className="text-gray-400 hover:text-gray-800 bg-white shadow-sm border border-gray-200 hover:bg-gray-50 p-1.5 rounded-full transition">
                <FiX size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar">
              <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-4 mb-4 border border-red-100 text-center shadow-sm">
                 <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">Total Amount</p>
                 <p className="text-3xl font-black text-red-600 tracking-tight">৳ {parseFloat(selectedExpense.amount).toLocaleString()}</p>
              </div>

              <div className="space-y-1 bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                <DetailRow label="Date" value={selectedExpense.expense_date} />
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
                 <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Remarks</p>
                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 text-amber-900 text-sm leading-relaxed">
                      {selectedExpense.remarks}
                    </div>
                 </div>
              )}
            </div>
            
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                <button onClick={() => setSelectedExpense(null)} className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm font-bold rounded-lg transition shadow-sm">
                  Close
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}