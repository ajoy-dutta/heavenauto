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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "login", element: <Login /> },
    ],
  },
  {
    path: "/dashboard",
    element: <AdminLayout />,
    children: [
      { path: "", element: <Dashboard /> },
      { path: "employees", element: <EmployeeManage /> },
      { path: "customers", element: <CustomerManage /> },
      { path: "employees/add", element: <AddEmployee /> },
      { path: "customers/add", element: <AddCustomer /> },
    ],
  },
]);