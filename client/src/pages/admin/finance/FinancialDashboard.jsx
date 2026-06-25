import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import { 
  FiPieChart, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign, 
  FiBriefcase, 
  FiShield,
  FiActivity,
  FiCreditCard,
  FiArrowUpRight,
  FiArrowDownRight,
  FiLayers
} from "react-icons/fi";

export default function FinancialDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    expense: 0,
    net_profit: 0,
    assets: 0,
    liabilities: 0,
    equity: 0,
    today_revenue: 0,
    today_expense: 0,
    today_capital: 0
  });

  const [recentPayments, setRecentPayments] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [recentCapitals, setRecentCapitals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      const [summaryRes, paymentsRes, expensesRes, capitalsRes] = await Promise.all([
        axiosInstance.get("account/summary/"),
        axiosInstance.get("payment/payments/"),
        axiosInstance.get("expense/expenses/"),
        axiosInstance.get("capital/entries/") 
      ]);

      setStats(summaryRes.data);

      const extractData = (res) => (res.data.results ? res.data.results : res.data).slice(0, 5);
      setRecentPayments(extractData(paymentsRes));
      setRecentExpenses(extractData(expensesRes));
      setRecentCapitals(extractData(capitalsRes));

      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load comprehensive financial data. Please check your network or server.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-emerald-600 font-bold animate-pulse flex items-center gap-2">
          <FiActivity className="animate-spin" /> Loading Command Center...
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-6 w-full bg-slate-50 min-h-screen">
      {error && (
        <div className="mb-4 p-4 text-sm text-red-600 bg-red-100 rounded-lg shadow-sm border border-red-200">
          {error}
        </div>
      )}

      {/* --- HEADER --- */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <FiPieChart className="text-emerald-600" />
            Financial Dashboard
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Live overview of Heaven Autos' master ledger and recent transactions.
          </p>
        </div>
        <button onClick={fetchFinancialData} className="text-sm font-bold text-blue-600 hover:text-blue-800 transition">
          ↻ Refresh Data
        </button>
      </div>

      {/* --- SECTION 1: MASTER KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <FiTrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.revenue)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <FiTrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Expenses</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.expense)}</p>
          </div>
        </div>

        <div className={`p-6 rounded-xl border shadow-sm flex items-start gap-4 ${stats.net_profit >= 0 ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-red-600 border-red-700 text-white'}`}>
          <div className={`p-3 rounded-lg ${stats.net_profit >= 0 ? 'bg-emerald-500/50' : 'bg-red-500/50'}`}>
            <FiDollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold opacity-90">Net Profit / (Loss)</p>
            <p className="text-3xl font-black">{formatCurrency(stats.net_profit)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <FiBriefcase size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Assets (Cash/Bank/Inv)</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(stats.assets)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <FiShield size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Liabilities</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(stats.liabilities)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <FiLayers size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Owner's Equity / Capital</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(stats.equity)}</p>
          </div>
        </div>
      </div>

      {/* --- SECTION 2: RECENT FINANCIAL ACTIVITY TRACKER --- */}
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">
        Recent Activity Streams & Summaries
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Stream 1: Recent Payments (Sales & Purchases) */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FiCreditCard className="text-blue-500" /> Revenue Stream
            </h3>
            {/* NEW: Total Summaries Badges */}
            <div className="flex justify-between mt-3 text-xs font-semibold">
               <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">Lifetime: {formatCurrency(stats.revenue)}</span>
               <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded border border-emerald-200">Today: {formatCurrency(stats.today_revenue)}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {recentPayments.length === 0 ? <p className="text-sm text-gray-400">No recent payments.</p> : null}
            {recentPayments.map(pay => (
              <div key={pay.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  {pay.payment_type === 'IN' ? (
                    <FiArrowUpRight className="text-emerald-500" size={20} />
                  ) : (
                    <FiArrowDownRight className="text-red-500" size={20} />
                  )}
                  <div>
                    <p className="text-sm font-bold text-slate-700 truncate w-32">{pay.payment_id}</p>
                    <p className="text-xs text-slate-500 font-medium">{pay.payment_method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-black ${pay.payment_type === 'IN' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {pay.payment_type === 'IN' ? '+' : '-'}{formatCurrency(pay.amount)}
                  </p>
                  <p className="text-xs text-slate-400 font-semibold">{formatDate(pay.payment_date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stream 2: Recent Expenses */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FiTrendingDown className="text-red-500" /> Expense Stream
            </h3>
            {/* NEW: Total Summaries Badges */}
            <div className="flex justify-between mt-3 text-xs font-semibold">
               <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">Lifetime: {formatCurrency(stats.expense)}</span>
               <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded border border-orange-200">Today: {formatCurrency(stats.today_expense)}</span>
            </div>
          </div>

          <div className="space-y-3">
            {recentExpenses.length === 0 ? <p className="text-sm text-gray-400">No recent expenses.</p> : null}
            {recentExpenses.map(exp => (
              <div key={exp.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-700 truncate w-32">{exp.main_category}</p>
                  <p className="text-xs text-slate-500 font-medium">{exp.expense_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-red-600">-{formatCurrency(exp.amount)}</p>
                  <p className="text-xs text-slate-400 font-semibold">{formatDate(exp.expense_date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stream 3: Recent Capital Inflows */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FiBriefcase className="text-indigo-500" /> Capital Stream
            </h3>
            {/* NEW: Total Summaries Badges */}
            <div className="flex justify-between mt-3 text-xs font-semibold">
               <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">Lifetime: {formatCurrency(stats.equity)}</span>
               <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200">Today: {formatCurrency(stats.today_capital)}</span>
            </div>
          </div>

          <div className="space-y-3">
            {recentCapitals.length === 0 ? <p className="text-sm text-gray-400">No recent capital logs.</p> : null}
            {recentCapitals.map(cap => (
              <div key={cap.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-700 truncate w-32">{cap.source_name}</p>
                  <p className="text-xs text-slate-500 font-medium">{cap.capital_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-indigo-600">+{formatCurrency(cap.amount)}</p>
                  <p className="text-xs text-slate-400 font-semibold">{formatDate(cap.transaction_date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}