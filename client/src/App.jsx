import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

// Import Admin Layout and Pages
import Dashboard from './pages/Dashboard';
import ShopProfile from './pages/admin/ShopProfile';
import Products from './pages/admin/Products';
import AdminPlaceholder from './pages/admin/AdminPlaceholder';

const AppLayout = () => {
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <>
      {!isDashboardRoute && <Header />}
      
      <Routes>
        {/* Public Store Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* Protected Admin Routes (Nested) */}
        <Route path="/dashboard" element={<Dashboard />}>
          {/* "index" means this loads when the URL is exactly /dashboard */}
          <Route index element={<AdminPlaceholder title="Main Dashboard Overview" />} />
          
          <Route path="profile" element={<ShopProfile />} />
          <Route path="products" element={<Products />} />
          
          {/* Reusing the placeholder for other routes */}
          <Route path="employees" element={<AdminPlaceholder title="Employee Management" />} />
          <Route path="exporter" element={<AdminPlaceholder title="Exporter Data" />} />
          <Route path="purchases" element={<AdminPlaceholder title="Purchase History" />} />
          <Route path="stock" element={<AdminPlaceholder title="Stock Inventory" />} />
          <Route path="settings" element={<AdminPlaceholder title="System Settings" />} />
          
          {/* Catch-all for any undefined dashboard links */}
          <Route path="*" element={<AdminPlaceholder title="Module Not Found" />} />
        </Route>
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;