import AdminSidebar from '../components/AdminSidebar';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      
      {/* Left Side: The Sidebar */}
      <AdminSidebar />

      {/* Right Side: Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Simple top bar for the dashboard content area */}
        <div className="h-14 bg-white shadow flex items-center px-6 justify-between shrink-0 z-10">
          <h1 className="text-xl font-bold text-gray-700">Admin Control Panel</h1>
          <div className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Admin User
          </div>
        </div>

        {/* Dynamic content goes here - Outlet injects the matched child route */}
        <div className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
        
      </div>
      
    </div>
  );
};

export default Dashboard;