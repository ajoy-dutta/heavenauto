import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-red-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">Heaven Autos</h1>
        <nav className="space-x-4">
          <Link to="/" className="hover:text-gray-200 font-semibold">Home</Link>
          <Link to="/login" className="hover:text-gray-200 font-semibold">Admin Login</Link>
        </nav>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white text-center p-4">
        <p>&copy; 2026 Heaven Autos. All rights reserved.</p>
      </footer>
    </div>
  );
}