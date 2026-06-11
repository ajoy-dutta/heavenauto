import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar"; // Adjust path if needed

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-gray-100 overflow-hidden">
      
      {/* Imported Sidebar Component 
        This handles all its own routing, dropdown state, and logout logic now.
      */}
      <AdminSidebar />

      {/* Main Admin Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <Outlet />
      </main>

    </div>
  );
}