import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axios";
import { FiSave, FiArrowLeft, FiDollarSign } from "react-icons/fi";

export default function AddExpense() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Dropdown Options
  const [employees, setEmployees] = useState([]);
  
  // Explicitly defined categories to map over
  const MAIN_CATEGORIES = ['Salary', 'Operational', 'Loan', 'Asset', 'Others'];
  const SUB_CATEGORIES = {
    'Salary': ['Basic Pay', 'Overtime', 'Bonus', 'Advance Salary'],
    'Operational': ['Rent', 'Utility', 'Office Supplies', 'Entertainment', 'Transportation', 'Maintenance', 'Marketing'],
    'Loan': ['Bank EMI', 'Private Loan'],
    'Asset': ['Furniture', 'IT Equipment', 'Tools'],
    'Others': ['Miscellaneous', 'Donation', 'Fines']
  };
  const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'bKash', 'Nagad', 'Rocket', 'Cheque'];

  const [formData, setFormData] = useState({
    main_category: "Operational",
    sub_category: "Utility",
    amount: "",
    payment_method: "Cash",
    transaction_id: "",
    remarks: "",
    // Salary specifics
    employee_recipient: "",
    salary_month: "",
    // Bank specifics
    bank_name: "",
    account_name: "",
    account_no: "",
    branch_name: "",
    // MFS specifics
    mfs_number: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get("person/employees/");
      setEmployees(response.data.results ? response.data.results : response.data);
    } catch (err) {
      console.error("Failed to load employees for salary list", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // When main category changes, auto-select the first item of the new sub-category array
    if (name === "main_category") {
      setFormData({
        ...formData,
        main_category: value,
        sub_category: SUB_CATEGORIES[value][0] || "",
        employee_recipient: value !== 'Salary' ? "" : formData.employee_recipient,
        salary_month: value !== 'Salary' ? "" : formData.salary_month,
      });
    } else if (name === "payment_method") {
        // Clear irrelevant financial details when payment method switches
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.amount || formData.amount <= 0) {
      setError("Please enter a valid amount.");
      setLoading(false);
      return;
    }
    if (formData.main_category === 'Salary' && !formData.employee_recipient) {
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
      navigate("/dashboard/finance/expense");
    } catch (err) {
      console.error("Submission error:", err.response?.data);
      setError(err.response?.data?.detail || "Failed to save expense. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  // Helper flags for rendering
  const isBank = formData.payment_method === 'Bank Transfer' || formData.payment_method === 'Cheque';
  const isMFS = ['bKash', 'Nagad', 'Rocket'].includes(formData.payment_method);

  return (
    <div className="p-4 max-w-5xl mx-auto text-gray-800">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
             <FiDollarSign className="text-blue-600" /> Record New Expense
          </h1>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 space-y-4">
          
          {/* Section 1: Categorization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Main Category *</label>
              <select
                name="main_category"
                value={formData.main_category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 outline-none text-sm"
              >
                {MAIN_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sub Category *</label>
              <select
                name="sub_category"
                value={formData.sub_category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 outline-none text-sm"
              >
                {SUB_CATEGORIES[formData.main_category]?.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 1.5: Salary Details (Conditional) */}
          {formData.main_category === 'Salary' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-blue-50 border border-blue-100 rounded">
                <div>
                  <label className="block text-sm font-semibold text-blue-800 mb-1">Select Employee *</label>
                  <select
                    name="employee_recipient"
                    value={formData.employee_recipient}
                    onChange={handleChange}
                    required={formData.main_category === 'Salary'}
                    className="w-full border border-blue-200 rounded p-2 focus:border-blue-500 outline-none text-sm"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} (ID: {emp.employee_id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-blue-800 mb-1">Salary Month</label>
                  <input
                    type="date"
                    name="salary_month"
                    value={formData.salary_month}
                    onChange={handleChange}
                    className="w-full border border-blue-200 rounded p-2 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
             </div>
          )}

          {/* Section 2: Financial Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Payment Method *</label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 outline-none text-sm"
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (৳) *</label>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                placeholder="0.00"
                className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 outline-none text-sm font-bold text-blue-700"
              />
            </div>

            {/* MFS Specific Field */}
            {isMFS && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{formData.payment_method} Number</label>
                <input
                  type="text"
                  name="mfs_number"
                  value={formData.mfs_number}
                  onChange={handleChange}
                  placeholder="e.g. 017..."
                  className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 outline-none text-sm"
                />
              </div>
            )}

            {/* Transaction ID */}
            <div className={isBank ? "lg:col-span-2" : ""}>
              <label className={`block text-sm font-semibold mb-1 ${formData.payment_method === 'Cash' ? 'text-gray-400' : 'text-gray-700'}`}>
                Transaction/Cheque ID {formData.payment_method !== 'Cash' && '*'}
              </label>
              <input
                type="text"
                name="transaction_id"
                value={formData.transaction_id}
                onChange={handleChange}
                disabled={formData.payment_method === 'Cash'}
                required={formData.payment_method !== 'Cash'}
                placeholder={formData.payment_method === 'Cash' ? "Not required for Cash" : "Enter TXN/Cheque ID"}
                className={`w-full border rounded p-2 text-sm outline-none transition-colors
                  ${formData.payment_method === 'Cash' 
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' 
                    : 'border-gray-300 focus:border-blue-500'}`}
              />
            </div>
          </div>

          {/* Bank Specific Details */}
          {isBank && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-gray-50 border border-gray-200 rounded">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bank Name</label>
                <input type="text" name="bank_name" value={formData.bank_name} onChange={handleChange} className="w-full border border-gray-300 rounded p-1.5 focus:border-blue-500 outline-none text-sm" placeholder="e.g. City Bank" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Account Name</label>
                <input type="text" name="account_name" value={formData.account_name} onChange={handleChange} className="w-full border border-gray-300 rounded p-1.5 focus:border-blue-500 outline-none text-sm" placeholder="Account Holder" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Account No.</label>
                <input type="text" name="account_no" value={formData.account_no} onChange={handleChange} className="w-full border border-gray-300 rounded p-1.5 focus:border-blue-500 outline-none text-sm" placeholder="123456789" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Branch</label>
                <input type="text" name="branch_name" value={formData.branch_name} onChange={handleChange} className="w-full border border-gray-300 rounded p-1.5 focus:border-blue-500 outline-none text-sm" placeholder="Branch Name" />
              </div>
            </div>
          )}

          {/* Section 3: Notes */}
          <div className="pt-4 border-t border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Remarks / Note</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              rows="2"
              placeholder="Add any specific details about this expense..."
              className="w-full border border-gray-300 rounded p-2 focus:border-blue-500 outline-none text-sm resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded text-sm font-medium text-gray-600 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-5 rounded transition disabled:opacity-50"
          >
            <FiSave />
            {loading ? "Recording..." : "Save Expense"}
          </button>
        </div>

      </form>
    </div>
  );
}