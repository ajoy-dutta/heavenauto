import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* HEADER: Navy/Black background with Blue accents */}
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center border-b-[3px] border-blue-600">
        {/* Branding */}
        <h1 className="text-2xl font-extrabold tracking-tight">
          Heaven <span className="text-blue-500">Autos</span>
        </h1>
        
        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-slate-300 hover:text-blue-400 transition-colors font-semibold"
          >
            Home
          </Link>
          <Link 
            to="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-all shadow-sm"
          >
            Admin Login
          </Link>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-6">
        <Outlet />
      </main>

      {/* FOOTER: Navy/Black matching the header */}
      <footer className="bg-slate-900 text-slate-400 text-center p-4 text-sm border-t border-slate-800">
        <p>&copy; 2026 Heaven Autos. All rights reserved.</p>
      </footer>
      
    </div>
  );
}