import { useState, useEffect } from "react";
import axiosInstance from "../../../api/axios";
import { FiBox, FiSearch, FiAlertTriangle, FiCheckCircle, FiRefreshCw, FiXCircle } from "react-icons/fi";

export default function StockList() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filtering States
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      // ✅ Updated to match your exact API route!
      const response = await axiosInstance.get("stock/stocks/"); 
      setStocks(response.data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load warehouse stock. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // Filter logic mapped exactly to your JSON
  const filteredStocks = stocks.filter((stock) => {
    
    // Safety check: using || "" prevents the page from crashing if a part_number is null
    const searchString = `${stock.product_name || ""} ${stock.part_number || ""} ${stock.category || ""}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
        
    // Dynamic Low Stock: Checks against the specific product's min_stock_level
    const threshold = stock.min_stock_level || 5; 
    const matchesLowStock = showLowStock ? stock.current_quantity <= threshold : true;

    return matchesSearch && matchesLowStock;
  });

  return (
    <div className="p-6 text-gray-100">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FiBox className="text-indigo-500" /> Live Warehouse Stock
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Automated ledger. Stock updates dynamically from Purchases and Sales.
          </p>
        </div>
        <button
          onClick={fetchStocks}
          className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-lg"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded mb-6 flex items-center gap-2">
          <FiAlertTriangle /> {error}
        </div>
      )}

      {/* Controls & Table Container */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-700 flex flex-col md:flex-row justify-between gap-4 bg-gray-900/50">
          
          {/* Search Bar */}
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 w-full md:w-96 focus-within:border-indigo-500 transition">
            <FiSearch className="text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search product, part number, or category..."
              className="w-full bg-transparent text-white focus:outline-none placeholder-gray-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Low Stock Toggle */}
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 border ${
              showLowStock 
                ? "bg-red-900/40 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                : "bg-gray-900 border-gray-600 text-gray-400 hover:text-white"
            }`}
          >
            <FiAlertTriangle /> {showLowStock ? "Viewing Low Stock Alerts" : "Filter Low Stock"}
          </button>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="p-12 text-center text-gray-400 animate-pulse">Scanning warehouse inventory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Product Info</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold text-right">Available Qty</th>
                  <th className="p-4 font-semibold text-right">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((stock) => {
                    
                    // Dynamic Status Calculation
                    const threshold = stock.min_stock_level || 5;
                    
                    let statusColor = "text-green-500";
                    let StatusIcon = FiCheckCircle;
                    let statusText = "In Stock";

                    if (stock.current_quantity <= 0) {
                      statusColor = "text-red-500";
                      StatusIcon = FiXCircle;
                      statusText = "Out of Stock";
                    } else if (stock.current_quantity <= threshold) {
                      statusColor = "text-yellow-500";
                      StatusIcon = FiAlertTriangle;
                      statusText = "Low Stock";
                    }

                    return (
                      <tr key={stock.id} className="hover:bg-gray-750 transition">
                        <td className="p-4">
                          <div className={`flex items-center gap-1.5 font-bold text-sm ${statusColor}`}>
                            <StatusIcon size={16} /> {statusText}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-gray-200">{stock.product_name}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">PN: {stock.part_number || "N/A"}</div>
                        </td>
                        <td className="p-4">
                          <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs font-medium">
                            {stock.category || "General"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className={`text-xl font-bold ${
                            stock.current_quantity <= threshold ? 'text-red-400' : 'text-indigo-400'
                          }`}>
                            {stock.current_quantity}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Min: {threshold}</div>
                        </td>
                        <td className="p-4 text-right text-sm text-gray-400">
                          {new Date(stock.last_updated).toLocaleString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute:'2-digit'
                          })}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-500">
                      {searchTerm || showLowStock 
                        ? "No items match your filter criteria." 
                        : "Your warehouse is currently empty."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}