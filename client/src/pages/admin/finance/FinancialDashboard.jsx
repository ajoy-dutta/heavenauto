import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import { 
  FiPieChart, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign, 
  FiBriefcase, 
  FiShield 
} from "react-icons/fi";

export default function FinancialDashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    expense: 0,
    net_profit: 0,
    assets: 0,
    liabilities: 0,
    equity: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFinancialSummary();
  }, []);

  const fetchFinancialSummary = async () => {
    try {
      // Fetching the pre-calculated stats directly from our Account app
      const response = await axiosInstance.get("account/summary/");
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load financial statistics. Is the server running?");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-emerald-600 font-bold animate-pulse">Loading Financial Data...</div>
      </div>
    );
  }

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div className="p-6 w-full bg-slate-50 min-h-screen">
      {error && (
        <div className="mb-4 p-4 text-sm text-red-600 bg-red-100 rounded-lg shadow-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
          <FiPieChart className="text-emerald-600" />
          Financial Dashboard
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Live overview of Heaven Autos' financial health, calculated directly from the master ledger.
        </p>
      </div>

      {/* Section 1: Income Statement (P&L) */}
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">
        Income Statement Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Revenue Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
            <FiTrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.revenue)}</p>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-lg">
            <FiTrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Expenses</p>
            <p className="text-2xl font-bold text-slate-800">{formatCurrency(stats.expense)}</p>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className={`p-6 rounded-xl border shadow-sm flex items-start gap-4 ${stats.net_profit >= 0 ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-red-600 border-red-700 text-white'}`}>
          <div className={`p-3 rounded-lg ${stats.net_profit >= 0 ? 'bg-emerald-500/50' : 'bg-red-500/50'}`}>
            <FiDollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold opacity-90">Net Profit / (Loss)</p>
            <p className="text-3xl font-black">{formatCurrency(stats.net_profit)}</p>
          </div>
        </div>
      </div>

      {/* Section 2: Balance Sheet Overview */}
      <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">
        Balance Sheet Health
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Assets */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <FiBriefcase size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Assets</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(stats.assets)}</p>
          </div>
        </div>

        {/* Liabilities */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <FiShield size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Liabilities</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(stats.liabilities)}</p>
          </div>
        </div>

        {/* Equity */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <FiPieChart size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Owner's Equity</p>
            <p className="text-xl font-bold text-slate-800">{formatCurrency(stats.equity)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}