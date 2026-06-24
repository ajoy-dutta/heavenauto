import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FiUsers, 
  FiUserPlus,
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
  FiCreditCard,
  FiLogOut
} from "react-icons/fi";
import logo from "../assets/logo.jpg";

export default function AdminSidebar() {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
        { to: "/dashboard/finance/capital-entries", label: "Capital & Investment", icon: FiDollarSign },
        { to: "/dashboard/finance/expense", label: "Expense Ledger", icon: FiDollarSign },
        { to: "/dashboard/finance/expense/add", label: "Record New Expense", icon: FiPlus },
      ]
    },

    // --- PEOPLE MANAGEMENT ---
    { id: "h_people", type: "heading", label: "People Management" },
    { 
      id: "people", type: "dropdown", label: "People & Staff", icon: FiUsers, stateKey: "people",
      subItems: [
        { to: "/dashboard/employees", label: "Employees", icon: FiUsers },
        { to: "/dashboard/employees/add", label: "Add Employee", icon: FiUserPlus },
        { to: "/dashboard/customers", label: "Customers", icon: FiUsers },
        { to: "/dashboard/customers/add", label: "Add Customer", icon: FiUserPlus },
      ]
    },
  ];

  useEffect(() => {
    navItems.forEach(item => {
      if (item.type === "dropdown" && item.subItems) {
        const hasActiveChild = item.subItems.some(sub => sub.to === location.pathname);
        if (hasActiveChild) {
          setOpenDropdowns(prev => ({ ...prev, [item.stateKey]: true }));
        }
      }
    });
  }, [location.pathname]);

  return (
    <>
      {!isMobileMenuOpen && (
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden fixed top-4 left-4 z-40 p-2.5 bg-slate-900 text-slate-100 rounded-xl shadow-xl border border-slate-800 hover:bg-slate-800 transition-all duration-300"
        >
          <FiMenu size={24} />
        </button>
      )}

      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800/60
        shadow-[4px_0_24px_rgba(0,0,0,0.3)]
        transform transition-transform duration-400 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-4 border-b border-slate-800/60 flex justify-between items-center bg-slate-950 shadow-sm z-10 relative">
          <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            <div className="p-1 bg-slate-800 rounded-lg group-hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="Heaven Autos Logo" className="h-9 w-auto rounded object-contain flex-shrink-0 brightness-95 contrast-105" />
            </div>
            <span className="text-lg font-black text-white tracking-tight">Heaven Autos</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-1.5 rounded-full transition-colors flex-shrink-0">
            <FiX size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            if (item.type === "heading") {
              return <div key={item.id} className="text-[11px] text-slate-500 uppercase tracking-widest font-black mb-2 mt-6 px-3">{item.label}</div>;
            }
            if (item.type === "link") {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link key={item.id} to={item.to} onClick={() => setIsMobileMenuOpen(false)} className={`group flex items-center gap-3 p-3 rounded-xl border border-transparent transition-all duration-300 text-sm font-bold ${isActive ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}>
                  <Icon size={18} className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            }
            if (item.type === "dropdown") {
              const Icon = item.icon;
              const isOpen = openDropdowns[item.stateKey];
              const hasActiveChild = item.subItems.some(sub => sub.to === location.pathname);
              return (
                <div key={item.id} className="mb-1">
                  <button onClick={() => toggleDropdown(item.stateKey)} className={`group w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 text-sm font-bold border hover:bg-slate-800/60 hover:text-white ${isOpen || hasActiveChild ? 'bg-transparent border-slate-800/40 text-slate-100' : 'bg-transparent border-transparent text-slate-400'}`}>
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={`transition-colors duration-300 ${isOpen || hasActiveChild ? 'text-slate-200 group-hover:text-white' : 'text-slate-400 group-hover:text-white'}`} />
                      <span>{item.label}</span>
                    </div>
                    <FiChevronRight size={18} className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-90 text-slate-200 group-hover:text-white' : 'group-hover:text-white'}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-1.5' : 'max-h-0 opacity-0'}`}>
                    <div className="ml-4 space-y-1 border-l-2 border-slate-800 pl-3">
                      {item.subItems.map((sub, idx) => {
                        const SubIcon = sub.icon;
                        const isSubActive = location.pathname === sub.to;
                        return (
                          <Link key={idx} to={sub.to} onClick={() => setIsMobileMenuOpen(false)} className={`group flex items-center gap-2.5 p-2.5 rounded-lg transition-all duration-300 text-sm font-medium hover:translate-x-1 ${isSubActive ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800/40 hover:text-white'}`}>
                            <SubIcon size={16} className={`transition-colors ${isSubActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} /> 
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </nav>

        <div className="border-t border-slate-800/60 mt-auto bg-slate-950 p-4 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)]">
          <button onClick={handleLogout} className="group flex items-center justify-center gap-2 w-full p-3 bg-red-950/30 border border-red-900/30 text-red-400 rounded-xl font-bold transition-all duration-300 hover:bg-red-600 hover:text-white shadow-sm">
            <FiLogOut size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
            Secure Logout
          </button>
        </div>
      </aside>
    </>
  );
}