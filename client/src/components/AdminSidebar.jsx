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
  FiMenu, // Added for mobile hamburger icon
  FiX     // Added for mobile close icon
} from "react-icons/fi";

export default function AdminSidebar() {
  // Existing state
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  
  // New state for mobile responsiveness
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navigate = useNavigate();

  // Integrated Logout Logic
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  return (
    <>
      {/* Mobile Hamburger Button (Floating top left) - Hidden on desktop */}
      {!isMobileMenuOpen && (
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 p-2 bg-gray-900 text-white rounded shadow-lg hover:bg-gray-800 transition"
        >
          <FiMenu size={24} />
        </button>
      )}

      {/* Mobile Background Overlay - Darkens background when sidebar is open */}
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
        
        {/* Brand Header */}
        <div className="p-6 text-2xl font-extrabold border-b border-gray-800 text-red-500 tracking-wider flex justify-between items-center">
          <span>HA ADMIN</span>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-400 hover:text-white transition"
          >
            <FiX size={28} />
          </button>
        </div>
        
        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          
          {/* Dashboard Home */}
          <Link 
            to="/dashboard" 
            onClick={() => setIsMobileMenuOpen(false)} // Close menu on click (mobile)
            className="flex items-center gap-2 p-3 rounded hover:bg-gray-800 transition font-medium text-white mb-2"
          >
            <FiHome className="text-gray-400" />
            <span>Dashboard Home</span>
          </Link>

          {/* --- PEOPLE MANAGEMENT SECTION --- */}
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-6 font-bold px-3">
            People
          </div>
          
          {/* Employee Dropdown */}
          <div>
            <button 
              onClick={() => setIsEmployeeOpen(!isEmployeeOpen)}
              className="w-full flex items-center justify-between p-3 rounded hover:bg-gray-800 transition text-gray-300"
            >
              <div className="flex items-center gap-2">
                <FiBriefcase className="text-gray-400" />
                <span>Employees</span>
              </div>
              {isEmployeeOpen ? <FiChevronDown /> : <FiChevronRight />}
            </button>
            
            {/* Employee Sub-menu Items */}
            {isEmployeeOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-2">
                <Link 
                  to="/dashboard/employees" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition text-sm text-gray-400 hover:text-white"
                >
                  <FiList /> Employee List
                </Link>
                <Link 
                  to="/dashboard/employees/add" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition text-sm text-gray-400 hover:text-white"
                >
                  <FiPlus /> Add New Employee
                </Link>
              </div>
            )}
          </div>

          {/* Customer Dropdown */}
          <div>
            <button 
              onClick={() => setIsCustomerOpen(!isCustomerOpen)}
              className="w-full flex items-center justify-between p-3 rounded hover:bg-gray-800 transition text-gray-300"
            >
              <div className="flex items-center gap-2">
                <FiUsers className="text-gray-400" />
                <span>Customers</span>
              </div>
              {isCustomerOpen ? <FiChevronDown /> : <FiChevronRight />}
            </button>
            
            {/* Customer Sub-menu Items */}
            {isCustomerOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-2">
                <Link 
                  to="/dashboard/customers" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition text-sm text-gray-400 hover:text-white"
                >
                  <FiList /> Customer List
                </Link>
                <Link 
                  to="/dashboard/customers/add" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition text-sm text-gray-400 hover:text-white"
                >
                  <FiPlus /> Add New Customer
                </Link>
              </div>
            )}
          </div>

          {/* --- INVENTORY & SALES SECTION --- */}
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 mt-6 font-bold px-3">
            Warehouse
          </div>
          <Link 
            to="/dashboard/products" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 p-3 rounded hover:bg-gray-800 transition text-gray-300 hover:text-white"
          >
            <FiBox className="text-gray-400" />
            <span>Stock Management</span>
          </Link>
          <Link 
            to="/dashboard/purchases" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 p-3 rounded hover:bg-gray-800 transition text-gray-300 hover:text-white"
          >
            <FiShoppingCart className="text-gray-400" />
            <span>Purchase History</span>
          </Link>
          <Link 
            to="/dashboard/sales" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 p-3 rounded hover:bg-gray-800 transition text-gray-300 hover:text-white"
          >
            <FiDollarSign className="text-gray-400" />
            <span>Sales & Profit</span>
          </Link>
          
        </nav>

        {/* Bottom Actions - Secure Logout */}
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