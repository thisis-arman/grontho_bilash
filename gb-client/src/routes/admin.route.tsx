
import { LucideLayoutDashboard } from "lucide-react";
import { LiaUsersCogSolid } from "react-icons/lia";
import AdminDashboard from "../pages/dashboard/adminDashboard/AdminDashboard";
import AdminProfile from "../pages/dashboard/adminDashboard/AdminProfile";
import OrderManagement from "../pages/dashboard/adminDashboard/OrderManagement";
import ProductManagement from "../pages/dashboard/adminDashboard/ProductManagement";
import UserManagement from "../pages/dashboard/adminDashboard/UserManagement";


export const adminPaths = [
  {
    name: "Dashboard",
    path: "dashboard",
    icon:<LucideLayoutDashboard />,
    element: <AdminDashboard/>,
  },
  {
    name: "User Management",
    path: "user-management",
    icon:<LiaUsersCogSolid />,
    element: <UserManagement/>,
  },
  {
    name: "Product Management",
    path: "product-management",
    icon:<LiaUsersCogSolid />,
    element: <ProductManagement/>,
  },
  {
    name: "Order Management",
    path: "order-management",
    icon:<LiaUsersCogSolid />,
    element: <OrderManagement/>,
  },
  {
    name: "Profile",
    path: "admin-profile",
    icon:<LiaUsersCogSolid />,
    element: <AdminProfile/>,
  },
];

