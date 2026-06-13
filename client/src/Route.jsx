import { createBrowserRouter } from "react-router-dom";

// Layouts
import Layout from "./layouts/Layout";
import AdminLayout from "./layouts/AdminLayout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";

// Admin Pages
import EmployeeManage from "./pages/admin/employee/EmployeeList";
import CustomerManage from "./pages/admin/customer/CustomerList";
import AddEmployee from "./pages/admin/employee/AddEmployee";
import AddCustomer from "./pages/admin/customer/AddCustomer";
import ProductList from "./pages/admin/products/ProductList";
import AddProduct from "./pages/admin/products/AddProduct";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> }, // Uses index: true for default root
      { path: "login", element: <Login /> },
    ],
  },
  {
    path: "/dashboard",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> }, // Default view when hitting /dashboard
      
      // Employee Routes
      { path: "employees", element: <EmployeeManage /> },
      { path: "employees/add", element: <AddEmployee /> },
      { path: "employees/edit/:id", element: <AddEmployee /> }, // ✅ Added Edit

      // Customer Routes
      { path: "customers", element: <CustomerManage /> },
      { path: "customers/add", element: <AddCustomer /> },
      { path: "customers/edit/:id", element: <AddCustomer /> }, // ✅ Added Edit

      // Product Routes
      { path: "products", element: <ProductList /> },
      { path: "products/add", element: <AddProduct /> },
      { path: "products/edit/:id", element: <AddProduct /> },   // ✅ Added Edit
    ],
  },
]);