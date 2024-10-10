
import AdminDashboard from "../pages/dashboard/adminDashboard/AdminDashboard";
import AdminProfile from "../pages/dashboard/adminDashboard/AdminProfile";
import OrderManagement from "../pages/dashboard/adminDashboard/OrderManagement";
import ProductManagement from "../pages/dashboard/adminDashboard/ProductManagement";
import UserManagement from "../pages/dashboard/adminDashboard/UserManagement";


export const adminPaths = [
  {
    name: "Dashboard",
    path: "dashboard",
    element: <AdminDashboard/>,
  },
  {
    name: "User Management",
    path: "user-management",
    element: <UserManagement/>,
  },
  {
    name: "Product Management",
    path: "product-management",
    element: <ProductManagement/>,
  },
  {
    name: "Order Management",
    path: "order-management",
    element: <OrderManagement/>,
  },
  {
    name: "Profile",
    path: "admin-profile",
    element: <AdminProfile/>,
  },
];

