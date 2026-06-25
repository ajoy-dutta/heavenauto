import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axios";
import {
  FiBox,
  FiUsers,
  FiBriefcase,
  FiAlertTriangle,
  FiTrendingUp,
  FiArrowRight,
  FiDollarSign,
  FiShoppingCart,
  FiPieChart,
  FiCreditCard,
  FiTruck,
  FiTag,
  FiPackage,
  FiBarChart2,
  FiActivity,
  FiZap,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";

// Helper to safely extract array from paginated or non-paginated response
const extractData = (response) => {
  return response.data.results || response.data || [];
};

// Linear regression for prediction
const predictNextValue = (data, xKey, yKey) => {
  if (data.length < 2) return null;
  const n = data.length;
  const indices = data.map((_, i) => i + 1);
  const values = data.map((d) => parseFloat(d[yKey]) || 0);
  const sumX = indices.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = indices.reduce((a, b, i) => a + b * values[i], 0);
  const sumX2 = indices.reduce((a, b) => a + b * b, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const nextX = n + 1;
  return slope * nextX + intercept;
};

// Group sales by date (or month)
const groupByDate = (sales, period = "day") => {
  const map = {};
  sales.forEach((sale) => {
    const date = new Date(sale.sale_date);
    let key;
    if (period === "day") {
      key = date.toISOString().split("T")[0];
    } else if (period === "month") {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    } else {
      key = date.toISOString().split("T")[0];
    }
    if (!map[key]) map[key] = 0;
    map[key] += parseFloat(sale.total_amount) || 0;
  });
  return Object.keys(map)
    .sort()
    .map((key) => ({
      date: key,
      amount: map[key],
    }));
};

// Group expenses by category
const groupExpensesByCategory = (expenses) => {
  const map = {};
  expenses.forEach((exp) => {
    const cat = exp.main_category || "Other";
    if (!map[cat]) map[cat] = 0;
    map[cat] += parseFloat(exp.amount) || 0;
  });
  return Object.keys(map).map((key) => ({
    name: key,
    value: map[key],
  }));
};

// Colors for pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD", "#F39C12"];

export default function Dashboard() {
  const [stats, setStats] = useState({
    productsCount: 0,
    lowStockCount: 0,
    customersCount: 0,
    employeesCount: 0,
    totalSales: 0,
    totalPurchases: 0,
    grossProfit: 0,
    totalExpenses: 0,
    netProfit: 0,
    totalCapital: 0,
    suppliersCount: 0,
    brandsCount: 0,
    totalStockValue: 0,
  });
  const [salesData, setSalesData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      const [
        productsRes,
        customersRes,
        employeesRes,
        stocksRes,
        salesRes,
        purchasesRes,
        expensesRes,
        capitalRes,
        suppliersRes,
        brandsRes,
      ] = await Promise.all([
        axiosInstance.get("products/"),
        axiosInstance.get("person/customers/"),
        axiosInstance.get("person/employees/"),
        axiosInstance.get("stock/stocks/"),
        axiosInstance.get("sale/sales/"),
        axiosInstance.get("purchase/purchases/"),
        axiosInstance.get("expense/expenses/"),
        axiosInstance.get("capital/entries/"),
        axiosInstance.get("supplier/suppliers/"),
        axiosInstance.get("brand/brands/"),
      ]);

      const products = extractData(productsRes);
      const customers = extractData(customersRes);
      const employees = extractData(employeesRes);
      const stocks = extractData(stocksRes);
      const sales = extractData(salesRes);
      const purchases = extractData(purchasesRes);
      const expenses = extractData(expensesRes);
      const capitalEntries = extractData(capitalRes);
      const suppliers = extractData(suppliersRes);
      const brands = extractData(brandsRes);

      // Low stock calculation
      let lowStockItemsCount = 0;
      products.forEach((product) => {
        const stockEntry = stocks.find((s) => String(s.product) === String(product.id));
        const currentQty = stockEntry ? stockEntry.current_quantity ?? 0 : 0;
        const minLevel = product.min_stock_level || 5;
        if (currentQty <= minLevel) lowStockItemsCount++;
      });

      // Sales totals
      let totalSales = 0;
      let grossProfit = 0;
      sales.forEach((sale) => {
        totalSales += parseFloat(sale.total_amount) || 0;
        if (sale.items) {
          sale.items.forEach((item) => {
            grossProfit += parseFloat(item.profit_bdt) || 0;
          });
        }
      });

      let totalPurchases = 0;
      purchases.forEach((p) => {
        totalPurchases += parseFloat(p.total_amount) || 0;
      });

      let totalExpenses = 0;
      expenses.forEach((e) => {
        totalExpenses += parseFloat(e.amount) || 0;
      });

      let totalCapital = 0;
      capitalEntries.forEach((c) => {
        totalCapital += parseFloat(c.amount) || 0;
      });

      let totalStockValue = 0;
      products.forEach((product) => {
        const stockEntry = stocks.find((s) => String(s.product) === String(product.id));
        const currentQty = stockEntry ? stockEntry.current_quantity ?? 0 : 0;
        const cost = parseFloat(product.purchase_cost_bdt) || 0;
        totalStockValue += currentQty * cost;
      });

      const netProfit = grossProfit - totalExpenses;

      setStats({
        productsCount: products.length,
        lowStockCount: lowStockItemsCount,
        customersCount: customers.length,
        employeesCount: employees.length,
        totalSales,
        totalPurchases,
        grossProfit,
        totalExpenses,
        netProfit,
        totalCapital,
        suppliersCount: suppliers.length,
        brandsCount: brands.length,
        totalStockValue,
      });

      // Prepare chart data
      const groupedSales = groupByDate(sales, "day").slice(-30); // last 30 days
      setSalesData(groupedSales);

      const expenseCategories = groupExpensesByCategory(expenses);
      setExpenseData(expenseCategories);

      // AI Prediction: predict next month's sales using linear regression on monthly data
      const monthlySales = groupByDate(sales, "month");
      if (monthlySales.length >= 2) {
        const pred = predictNextValue(monthlySales, "date", "amount");
        setPrediction(pred);
      } else {
        setPrediction(null);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to load dashboard statistics:", error);
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return value.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Trend indicator for net profit
  const profitTrend = stats.netProfit > 0 ? "positive" : "negative";

  // Calculate growth percentages (for AI insights)
  const salesGrowth = useMemo(() => {
    if (salesData.length < 2) return 0;
    const current = salesData[salesData.length - 1]?.amount || 0;
    const previous = salesData[salesData.length - 2]?.amount || 0;
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }, [salesData]);

  // Loading screen with animation
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600 mr-3"></div>
        <span>Compiling system analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center animate-fadeInDown">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time metrics for Heaven Autos.</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-white px-4 py-2 rounded-full shadow-sm border">
          <FiZap className="text-yellow-500" />
          <span className="font-medium text-gray-700">AI Insights: Active</span>
        </div>
      </div>

      {/* Row 1: Core Business Metrics (with reduced padding) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeInUp">
        {[
          {
            label: "Total Parts",
            value: stats.productsCount,
            icon: FiBox,
            color: "indigo",
            link: "/dashboard/products",
          },
          {
            label: "Low Stock Alerts",
            value: stats.lowStockCount,
            icon: FiAlertTriangle,
            color: stats.lowStockCount > 0 ? "amber" : "emerald",
            link: "/dashboard/stock",
          },
          {
            label: "Customers",
            value: stats.customersCount,
            icon: FiUsers,
            color: "cyan",
            link: "/dashboard/customers",
          },
          {
            label: "Staff",
            value: stats.employeesCount,
            icon: FiBriefcase,
            color: "emerald",
            link: "/dashboard/employees",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:border-${card.color}-300"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
                <h3 className="text-2xl font-black text-gray-900">{card.value}</h3>
              </div>
              <div className={`p-2 bg-${card.color}-50 rounded text-${card.color}-600`}>
                <card.icon size={20} />
              </div>
            </div>
            <Link
              to={card.link}
              className="text-xs font-semibold mt-3 inline-flex items-center gap-1 hover:underline transition-colors"
              style={{ color: `var(--tw-color-${card.color}-600)` }}
            >
              View <FiArrowRight size={12} />
            </Link>
          </div>
        ))}
      </div>

      {/* Row 2: Financial Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeInUp" style={{ animationDelay: "200ms" }}>
        {[
          {
            label: "Total Sales",
            value: formatCurrency(stats.totalSales),
            icon: FiDollarSign,
            color: "blue",
          },
          {
            label: "Gross Profit",
            value: formatCurrency(stats.grossProfit),
            icon: FiTrendingUp,
            color: "green",
          },
          {
            label: "Expenses",
            value: formatCurrency(stats.totalExpenses),
            icon: FiCreditCard,
            color: "rose",
          },
          {
            label: "Net Profit",
            value: formatCurrency(stats.netProfit),
            icon: FiPieChart,
            color: stats.netProfit >= 0 ? "purple" : "red",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${(idx + 2) * 100}ms` }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
                <h3 className={`text-2xl font-black ${card.color === "red" ? "text-red-600" : "text-gray-900"}`}>
                  ৳{card.value}
                </h3>
              </div>
              <div className={`p-2 bg-${card.color}-50 rounded text-${card.color}-600`}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 3: Operational & Inventory */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeInUp" style={{ animationDelay: "400ms" }}>
        {[
          {
            label: "Inventory Value",
            value: formatCurrency(stats.totalStockValue),
            icon: FiPackage,
            color: "amber",
          },
          {
            label: "Purchases",
            value: formatCurrency(stats.totalPurchases),
            icon: FiShoppingCart,
            color: "sky",
          },
          {
            label: "Capital",
            value: formatCurrency(stats.totalCapital),
            icon: FiBriefcase,
            color: "violet",
          },
          {
            label: "Suppliers",
            value: stats.suppliersCount,
            icon: FiTruck,
            color: "orange",
            link: "/dashboard/suppliers",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${(idx + 4) * 100}ms` }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{card.label}</p>
                <h3 className="text-2xl font-black text-gray-900">
                  {typeof card.value === "string" ? "৳" + card.value : card.value}
                </h3>
              </div>
              <div className={`p-2 bg-${card.color}-50 rounded text-${card.color}-600`}>
                <card.icon size={20} />
              </div>
            </div>
            {card.link && (
              <Link
                to={card.link}
                className="text-xs font-semibold mt-3 inline-flex items-center gap-1 hover:underline transition-colors text-orange-600"
              >
                View <FiArrowRight size={12} />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Row 4: Charts and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fadeInUp" style={{ animationDelay: "600ms" }}>
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <FiBarChart2 className="text-indigo-500" /> Sales Trend (Last 30 Days)
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-medium">
              {salesGrowth > 0 ? `↑ ${salesGrowth.toFixed(1)}%` : `↓ ${Math.abs(salesGrowth).toFixed(1)}%`}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(str) => str.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(val) => `৳${val.toFixed(2)}`} />
              <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="#a5b4fc" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
          {prediction !== null && (
            <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
              <FiActivity className="text-purple-500" />
              <span>
                AI Prediction: Next month's sales estimated at <strong>৳{formatCurrency(prediction)}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Expense Breakdown Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
          <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
            <FiPieChart className="text-rose-500" /> Expense Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={expenseData.length ? expenseData : [{ name: "No Data", value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `৳${val.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
          {expenseData.length === 0 && (
            <div className="text-center text-xs text-gray-400">No expense data available</div>
          )}
        </div>
      </div>

      {/* Row 5: AI Smart Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 shadow-sm animate-fadeInUp" style={{ animationDelay: "800ms" }}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
            <FiZap size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800">📊 AI Smart Insights</h4>
            <ul className="text-xs text-gray-700 mt-1 space-y-1">
              <li>• <strong>Sales Growth:</strong> {salesGrowth > 0 ? "Upward" : "Downward"} trend of {Math.abs(salesGrowth).toFixed(1)}% over the last two days.</li>
              <li>• <strong>Profitability:</strong> Net profit is <span className={stats.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}>{stats.netProfit >= 0 ? "positive" : "negative"}</span> (৳{formatCurrency(stats.netProfit)}).</li>
              <li>• <strong>Inventory Health:</strong> {stats.lowStockCount} products are below minimum stock. {stats.lowStockCount > 0 ? "Consider reordering soon." : "Stock levels are healthy."}</li>
              <li>• <strong>Expense Ratio:</strong> Expenses are {stats.totalSales > 0 ? ((stats.totalExpenses / stats.totalSales) * 100).toFixed(1) : 0}% of total sales.</li>
              {prediction !== null && (
                <li>• <strong>Forecast:</strong> Next month's sales projected at ৳{formatCurrency(prediction)}.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Placeholder for additional charts (if needed) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fadeInUp" style={{ animationDelay: "1000ms" }}>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm h-48 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <FiTrendingUp size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">Advanced Analytics Coming Soon</p>
            <p className="text-xs">Profit vs Expenses comparison</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm h-48 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <FiActivity size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm font-medium">Customer Retention Insights</p>
            <p className="text-xs">Based on purchase history</p>
          </div>
        </div>
      </div>
    </div>
  );
}