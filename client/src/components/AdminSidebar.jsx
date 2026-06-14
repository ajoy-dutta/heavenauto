import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiUsers, 
  FiBriefcase, 
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
  FiAlertCircle,
  FiFileText,
  FiPieChart,
  FiSettings
} from "react-icons/fi";

export default function AdminSidebar() {
  // Single state object to handle ALL dropdowns dynamically
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

  // 🚀 The ultimate scalable navigation array (11 Options + Headings)
  const navItems = [
    { id: 1, type: "link", to: "/dashboard", label: "Dashboard Home", icon: FiHome },
    
    // --- PEOPLE MANAGEMENT ---
    { id: "h1", type: "heading", label: "People" },
    { 
      id: 2, type: "dropdown", label: "Employees", icon: FiBriefcase, stateKey: "employees",
      subItems: [
        { to: "/dashboard/employees", label: "Employee List", icon: FiList },
        { to: "/dashboard/employees/add", label: "Add New Employee", icon: FiPlus },
      ]
    },
    { 
      id: 3, type: "dropdown", label: "Customers", icon: FiUsers, stateKey: "customers",
      subItems: [
        { to: "/dashboard/customers", label: "Customer List", icon: FiList },
        { to: "/dashboard/customers/add", label: "Add New Customer", icon: FiPlus },
      ]
    },

    // --- WAREHOUSE & INVENTORY ---
    { id: "h2", type: "heading", label: "Warehouse" },
    { 
      id: 4, type: "dropdown", label: "Products", icon: FiBox, stateKey: "products",
      subItems: [
        { to: "/dashboard/products", label: "Product List", icon: FiList },
        { to: "/dashboard/products/add", label: "Add New Product", icon: FiPlus },
      ]
    },
    { id: 5, type: "link", to: "/dashboard/purchases", label: "Purchase History", icon: FiShoppingCart },
    { id: 6, type: "link", to: "/dashboard/sales", label: "Sales & Profit", icon: FiDollarSign },

    // --- ACCOUNTS & REPORTS (Added to meet the 11 options requirement) ---
    { id: "h3", type: "heading", label: "Business Operations" },
    { id: 7, type: "link", to: "/dashboard/suppliers", label: "Suppliers & Brands", icon: FiTruck },
    { id: 8, type: "link", to: "/dashboard/stock-alerts", label: "Stock Alerts", icon: FiAlertCircle },
    { id: 9, type: "link", to: "/dashboard/accounts", label: "Accounts & Ledgers", icon: FiFileText },
    { id: 10, type: "link", to: "/dashboard/reports", label: "System Reports", icon: FiPieChart },
    { id: 11, type: "link", to: "/dashboard/settings", label: "Settings", icon: FiSettings },
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
        <div className="p-6 text-2xl font-extrabold border-b border-gray-800 text-red-500 tracking-wider flex justify-between items-center">
          <span>HA ADMIN</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white transition"
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