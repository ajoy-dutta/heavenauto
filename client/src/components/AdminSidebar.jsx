import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiUsers, 
  FiChevronDown, 
  FiChevronRight, 
  FiList, 
  FiPlus,
  FiBox,
  FiShoppingCart,
  FiDollarSign,
  FiHome,
  FiMenu, 
  FiX,
  FiTruck,
  FiPieChart,
  FiLayers,
  FiCreditCard // <-- Added icon for Payments
} from "react-icons/fi";
import logo from "../assets/logo.jpg";

export default function AdminSidebar() {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Reorganized Navigation Array
  const navItems = [
    { id: 1, type: "link", to: "/dashboard", label: "Dashboard Home", icon: FiHome },
    
    // --- TRADES ---
    { id: "h_trades", type: "heading", label: "Trades" },
    { 
      id: "sales", type: "dropdown", label: "Sales", icon: FiDollarSign, stateKey: "sales",
      subItems: [
        { to: "/dashboard/sales/add", label: "New Sale", icon: FiPlus },
        { to: "/dashboard/sales", label: "Sale History", icon: FiList },
      ]
    },
    { 
      id: "purchases", type: "dropdown", label: "Purchases", icon: FiShoppingCart, stateKey: "purchases",
      subItems: [
        { to: "/dashboard/purchase/add", label: "New Purchase", icon: FiPlus },
        { to: "/dashboard/purchase", label: "Purchase History", icon: FiList },
      ]
    },
    // --- NEW PAYMENTS DROPDOWN ---
    { 
      id: "payments", type: "dropdown", label: "Payments", icon: FiCreditCard, stateKey: "payments",
      subItems: [
        { to: "/dashboard/payments", label: "Payment Center", icon: FiDollarSign },
        { to: "/dashboard/payment-history", label: "Payment Ledger", icon: FiList },
      ]
    },
    { id: "stock", type: "link", to: "/dashboard/stock", label: "Live Stock", icon: FiBox },

    // --- MASTER MANAGEMENT ---
    { id: "h_master", type: "heading", label: "Master Management" },
    { 
      id: "products", type: "dropdown", label: "Products", icon: FiLayers, stateKey: "products",
      subItems: [
        { to: "/dashboard/products", label: "Product List", icon: FiList },
        { to: "/dashboard/products/add", label: "Add New Product", icon: FiPlus },
      ]
    },
    { 
      id: "partners", type: "dropdown", label: "Suppliers & Brands", icon: FiTruck, stateKey: "partners",
      subItems: [
        { to: "/dashboard/suppliers", label: "Supplier Directory", icon: FiUsers },
        { to: "/dashboard/brands", label: "Brands Master", icon: FiBox },
      ]
    },
    
    // --- FINANCE ---
    { id: "h_finance", type: "heading", label: "Finance" },
    { 
      id: "finance", type: "dropdown", label: "Finance & Accounts", icon: FiPieChart, stateKey: "finance",
      subItems: [
        { to: "/dashboard/finance/dashboard", label: "Financial Dashboard", icon: FiPieChart },
        { to: "/dashboard/finance/chart-of-accounts", label: "Chart of Accounts", icon: FiList },
      ]
    },
  ];

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      {!isMobileMenuOpen && (
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 p-2 bg-gray-900 text-white rounded shadow-lg hover:bg-gray-800 transition"
        >
          <FiMenu size={24} />
        </button>
      )}

      {/* Mobile Background Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col min-h-screen shadow-2xl 
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
          <Link 
            to="/dashboard" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src={logo} 
              alt="Heaven Autos Logo" 
              className="h-10 w-auto rounded object-contain flex-shrink-0" 
            />
            <span className="text-lg font-bold text-white tracking-wide">
              Heaven Autos
            </span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white transition flex-shrink-0"
          >
            <FiX size={28} />
          </button>
        </div>
        
        {/* Navigation Map */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            
            // 1. Render Headings
            if (item.type === "heading") {
              return (
                <div key={item.id} className="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-6 font-bold px-3">
                  {item.label}
                </div>
              );
            }

            // 2. Render Single Links
            if (item.type === "link") {
              const Icon = item.icon;
              return (
                <Link 
                  key={item.id}
                  to={item.to} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-3 rounded hover:bg-gray-800 transition font-medium text-gray-300 hover:text-white mb-1"
                >
                  <Icon className="text-gray-400" />
                  <span>{item.label}</span>
                </Link>
              );
            }

            // 3. Render Dropdowns
            if (item.type === "dropdown") {
              const Icon = item.icon;
              const isOpen = openDropdowns[item.stateKey];
              
              return (
                <div key={item.id} className="mb-1">
                  <button 
                    onClick={() => toggleDropdown(item.stateKey)}
                    className="w-full flex items-center justify-between p-3 rounded hover:bg-gray-800 transition text-gray-300"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="text-gray-400" />
                      <span>{item.label}</span>
                    </div>
                    {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                  </button>
                  
                  {isOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-2">
                      {item.subItems.map((sub, idx) => {
                        const SubIcon = sub.icon;
                        return (
                          <Link 
                            key={idx}
                            to={sub.to} 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition text-sm text-gray-400 hover:text-white"
                          >
                            <SubIcon /> {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="border-t border-gray-800 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full p-4 bg-red-600 hover:bg-red-700 text-center font-bold transition duration-300"
          >
            Secure Logout
          </button>
        </div>
      </aside>
    </>
  );
}