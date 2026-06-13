import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { 
  FiBox, 
  FiUsers, 
  FiBriefcase, 
  FiAlertTriangle, 
  FiTrendingUp,
  FiArrowRight
} from "react-icons/fi";

export default function Dashboard() {
  const [stats, setStats] = useState({
    productsCount: 0,
    lowStockCount: 0,
    customersCount: 0,
    employeesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      // Fetch all core data simultaneously
      const [productsRes, customersRes, employeesRes] = await Promise.all([
        axiosInstance.get("products/"),
        axiosInstance.get("customers/"),
        axiosInstance.get("employees/")
      ]);

      const products = productsRes.data;
      
      // Calculate how many products are at or below their reorder point
      const lowStockItems = products.filter(
        (p) => p.stock_quantity <= (p.min_stock_level || 5)
      ).length;

      setStats({
        productsCount: products.length,
        lowStockCount: lowStockItems,
        customersCount: customersRes.data.length,
        employeesCount: employeesRes.data.length,
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to load dashboard statistics:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mr-3"></div>
        <span>Compiling system analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Overview</h1>
        <p className="text-sm text-gray-400 mt-1">Real-time metrics for Heaven Autos.</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Products Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-xl flex flex-col justify-between hover:border-indigo-500/50 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Parts in DB</p>
              <h3 className="text-3xl font-black text-white">{stats.productsCount}</h3>
            </div>
            <div className="p-3 bg-indigo-900/30 rounded text-indigo-400">
              <FiBox size={24} />
            </div>
          </div>
          <Link to="/dashboard/products" className="text-xs text-indigo-400 font-semibold mt-4 flex items-center gap-1 hover:text-indigo-300">
            View Inventory <FiArrowRight />
          </Link>
        </div>

        {/* Low Stock Alert Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-xl flex flex-col justify-between hover:border-amber-500/50 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Low Stock Alerts</p>
              <h3 className={`text-3xl font-black ${stats.lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {stats.lowStockCount}
              </h3>
            </div>
            <div className={`p-3 rounded ${stats.lowStockCount > 0 ? 'bg-amber-900/30 text-amber-400 animate-pulse' : 'bg-gray-800 text-gray-500'}`}>
              <FiAlertTriangle size={24} />
            </div>
          </div>
          <Link to="/dashboard/products" className="text-xs text-amber-400 font-semibold mt-4 flex items-center gap-1 hover:text-amber-300">
            Check Thresholds <FiArrowRight />
          </Link>
        </div>

        {/* Customers Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-xl flex flex-col justify-between hover:border-cyan-500/50 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Registered Clients</p>
              <h3 className="text-3xl font-black text-white">{stats.customersCount}</h3>
            </div>
            <div className="p-3 bg-cyan-900/30 rounded text-cyan-400">
              <FiUsers size={24} />
            </div>
          </div>
          <Link to="/dashboard/customers" className="text-xs text-cyan-400 font-semibold mt-4 flex items-center gap-1 hover:text-cyan-300">
            Manage Clients <FiArrowRight />
          </Link>
        </div>

        {/* Employees Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-xl flex flex-col justify-between hover:border-emerald-500/50 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Active Staff</p>
              <h3 className="text-3xl font-black text-white">{stats.employeesCount}</h3>
            </div>
            <div className="p-3 bg-emerald-900/30 rounded text-emerald-400">
              <FiBriefcase size={24} />
            </div>
          </div>
          <Link to="/dashboard/employees" className="text-xs text-emerald-400 font-semibold mt-4 flex items-center gap-1 hover:text-emerald-300">
            Staff Directory <FiArrowRight />
          </Link>
        </div>

      </div>

      {/* Placeholder for Future Charts */}
      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-6 shadow-xl h-64 flex flex-col items-center justify-center text-gray-500">
        <FiTrendingUp size={48} className="mb-4 opacity-50" />
        <p className="font-semibold">Sales & Revenue charts will appear here</p>
        <p className="text-xs mt-2">Waiting for transaction data integration...</p>
      </div>
    </div>
  );
}