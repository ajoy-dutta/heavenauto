import { Link } from 'react-router-dom';
import { FiUser, FiMonitor, FiSettings, FiBarChart2, FiLogOut } from "react-icons/fi";
import { FaCaretDown } from "react-icons/fa";

const AdminSidebar = () => {
  // Mapping the exact menu items from your provided image
  const menuItems = [
  { name: 'Shop Profile', icon: FiUser, isDropdown: false, path: '/dashboard/profile' },
  { name: 'Dashboard', icon: FiMonitor, isDropdown: false, path: '/dashboard' },
  // Let's point these to placeholder routes for now
  { name: 'Employee Manage', icon: FiSettings, isDropdown: true, path: '/dashboard/employees' },
  { name: 'Product', icon: FiSettings, isDropdown: true, path: '/dashboard/products' },
  { name: 'Exporter', icon: FiSettings, isDropdown: true, path: '/dashboard/exporter' },
  // You can add paths to the rest as you build them
  { name: 'Product Purchase', icon: FiBarChart2, isDropdown: false, path: '/dashboard/purchases' },
  { name: 'Stock', icon: FiSettings, isDropdown: true, path: '/dashboard/stock' },
  { name: 'Settings', icon: FiSettings, isDropdown: true, path: '/dashboard/settings' },
  { name: 'Logout', icon: FiLogOut, isDropdown: false, path: '/' },
];

  return (
    <div className="w-64 min-h-screen bg-[#304156] text-white flex flex-col font-sans">
      
      {/* Top Logo Area */}
      <div className="flex items-center h-14 bg-[#263445] px-4 font-bold text-lg tracking-wide border-b border-gray-700/50">
        <div className="bg-white text-ha-red font-black px-1.5 py-0.5 text-xs rounded mr-2 flex flex-col items-center leading-none">
          <span>h</span><span className="text-black">a</span>
        </div>
        HEAVEN AUTOS
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        {menuItems.map((item, index) => (
          <Link 
            key={index}
            to={item.path || "#"}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-[#263445] transition-colors border-b border-[#3b4d63] cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <item.icon className="text-[#3b82f6] text-lg group-hover:text-blue-400" />
              <span className="text-sm font-semibold text-gray-200 group-hover:text-white">
                {item.name}
              </span>
            </div>
            {item.isDropdown && (
              <FaCaretDown className="text-[#3b82f6] text-xs" />
            )}
          </Link>
        ))}
      </div>
      
    </div>
  );
};

export default AdminSidebar;