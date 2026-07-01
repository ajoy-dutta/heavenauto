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
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/");
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
        { to: "/dashboard/sales/draft", label: "New Draft", icon: FiPlus },
        { to: "/dashboard/sales/draftlist", label: "Draft List", icon: FiList },
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

  // Auto-open dropdown if a sub-item is active
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.type === "dropdown" && item.subItems) {
        const hasActiveChild = item.subItems.some((sub) => sub.to === location.pathname);
        if (hasActiveChild) {
          setOpenDropdowns((prev) => ({ ...prev, [item.stateKey]: true }));
        }
      }
    });
  }, [location.pathname]);

  return (
    <>
      {/* Global glass tokens — keep in sync with any parent theme */}
      <style>{`
        .glass-surface {
          background: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%);
          backdrop-filter: blur(24px) saturate(160%);
          -webkit-backdrop-filter: blur(24px) saturate(160%);
          border: 1px solid rgba(255,255,255,0.14);
        }
        .glass-panel {
          background: linear-gradient(165deg, rgba(30,32,42,0.72) 0%, rgba(14,15,22,0.85) 100%);
          backdrop-filter: blur(30px) saturate(180%);
          -webkit-backdrop-filter: blur(30px) saturate(180%);
        }
        .glass-btn {
          position: relative;
          background: linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255,255,255,0.09);
          backdrop-filter: blur(14px) saturate(140%);
          -webkit-backdrop-filter: blur(14px) saturate(140%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.2);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(120deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 32%);
          opacity: 0.9;
          pointer-events: none;
        }
        .glass-btn:hover {
          background: linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 100%);
          border-color: rgba(255,255,255,0.20);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.28);
          transform: translateY(-1px);
        }
        .glass-btn:active {
          transform: translateY(0px) scale(0.985);
          transition-duration: 0.12s;
        }
        .glass-btn-active {
          background: linear-gradient(180deg, rgba(99,140,255,0.32) 0%, rgba(70,100,220,0.20) 100%);
          border: 1px solid rgba(147,180,255,0.45);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -1px 0 rgba(0,0,0,0.15), 0 4px 20px rgba(80,110,255,0.25);
        }
        .glass-btn-danger {
          background: linear-gradient(180deg, rgba(255,90,90,0.16) 0%, rgba(200,40,40,0.10) 100%);
          border: 1px solid rgba(255,120,120,0.22);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.10), 0 1px 2px rgba(0,0,0,0.2);
        }
        .glass-btn-danger:hover {
          background: linear-gradient(180deg, rgba(255,70,70,0.55) 0%, rgba(200,30,30,0.55) 100%);
          border-color: rgba(255,150,150,0.5);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 6px 20px rgba(255,60,60,0.30);
        }
        .glass-scrollbar::-webkit-scrollbar { width: 6px; }
        .glass-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .glass-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 999px;
        }
        .glass-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); }
      `}</style>

      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="glass-btn md:hidden fixed top-4 left-4 z-40 p-3 text-white rounded-2xl shadow-xl"
        >
          <FiMenu size={22} />
        </button>
      )}

      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-950/50 backdrop-blur-md z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col min-h-screen text-slate-200 glass-panel
        border-r border-white/10 shadow-[8px_0_40px_rgba(0,0,0,0.45)]
        transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* subtle top sheen */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.06] to-transparent" />

        <div className="relative p-4 border-b border-white/10 flex justify-between items-center z-10">
          <Link
            to="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 group"
          >
            <div className="glass-surface p-1.5 rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-inner">
              <img
                src={logo}
                alt="Heaven Autos Logo"
                className="h-9 w-auto rounded-lg object-contain flex-shrink-0 brightness-100"
              />
            </div>
            <span className="text-lg font-black text-white tracking-tight drop-shadow-sm">
              Heaven Autos
            </span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="glass-btn md:hidden text-slate-300 hover:text-white p-2 rounded-xl flex-shrink-0"
          >
            <FiX size={18} />
          </button>
        </div>

        <nav className="relative flex-1 p-3.5 space-y-1.5 overflow-y-auto glass-scrollbar z-10">
          {navItems.map((item) => {
            if (item.type === "heading") {
              return (
                <div
                  key={item.id}
                  className="text-[10.5px] text-slate-400/80 uppercase tracking-[0.18em] font-bold mb-2 mt-6 px-3 first:mt-2"
                >
                  {item.label}
                </div>
              );
            }
            if (item.type === "link") {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`group flex items-center gap-3 p-3 rounded-2xl text-sm font-semibold glass-btn ${
                    isActive ? "glass-btn-active text-white" : "text-slate-300"
                  }`}
                >
                  <Icon
                    size={18}
                    className={`transition-colors duration-300 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  <span className="group-hover:text-white transition-colors duration-300">
                    {item.label}
                  </span>
                </Link>
              );
            }
            if (item.type === "dropdown") {
              const Icon = item.icon;
              const isOpen = openDropdowns[item.stateKey];
              const hasActiveChild = item.subItems.some((sub) => sub.to === location.pathname);
              return (
                <div key={item.id} className="mb-1">
                  <button
                    onClick={() => toggleDropdown(item.stateKey)}
                    className={`group w-full flex items-center justify-between p-3 rounded-2xl text-sm font-semibold glass-btn ${
                      isOpen || hasActiveChild ? "glass-btn-active text-white" : "text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={18}
                        className={`transition-colors duration-300 ${
                          isOpen || hasActiveChild
                            ? "text-white"
                            : "text-slate-400 group-hover:text-white"
                        }`}
                      />
                      <span className="group-hover:text-white transition-colors duration-300">
                        {item.label}
                      </span>
                    </div>
                    <FiChevronRight
                      size={16}
                      className={`text-slate-400 transition-transform duration-300 ${
                        isOpen ? "rotate-90 text-white" : "group-hover:text-white"
                      }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen ? "max-h-96 opacity-100 mt-1.5" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="ml-3.5 space-y-1 border-l border-white/10 pl-3 py-0.5">
                      {item.subItems.map((sub, idx) => {
                        const SubIcon = sub.icon;
                        const isSubActive = location.pathname === sub.to;
                        return (
                          <Link
                            key={idx}
                            to={sub.to}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`group flex items-center gap-2.5 p-2.5 rounded-xl text-[13px] font-medium glass-btn ${
                              isSubActive ? "glass-btn-active text-white" : "text-slate-400"
                            }`}
                          >
                            <SubIcon
                              size={15}
                              className={`transition-colors ${
                                isSubActive ? "text-white" : "text-slate-500 group-hover:text-white"
                              }`}
                            />
                            <span className="group-hover:text-white transition-colors duration-300">
                              {sub.label}
                            </span>
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

        <div className="relative border-t border-white/10 mt-auto p-3.5 z-10">
          <button
            onClick={handleLogout}
            className="glass-btn glass-btn-danger group flex items-center justify-center gap-2 w-full p-3 text-red-200 rounded-2xl font-semibold text-sm hover:text-white"
          >
            <FiLogOut size={17} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
            Secure Logout
          </button>
        </div>
      </aside>
    </>
  );
}
