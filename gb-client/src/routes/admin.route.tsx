
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ShoppingBag, 
  UserCircle 
} from "lucide-react";
import AdminDashboard from "../pages/dashboard/adminDashboard/AdminDashboard";
import AdminProfile from "../pages/dashboard/adminDashboard/AdminProfile";
import OrderManagement from "../pages/dashboard/adminDashboard/OrderManagement";
import ProductManagement from "../pages/dashboard/adminDashboard/ProductManagement";
import UserManagement from "../pages/dashboard/adminDashboard/UserManagement";

export const adminPaths = [
  {
    name: "Dashboard",
    path: "dashboard",
    icon: <LayoutDashboard size={18} />,
    element: <AdminDashboard />,
  },
  {
    name: "User Management",
    path: "user-management",
    icon: <Users size={18} />,
    element: <UserManagement />,
  },
  {
    name: "Product Management",
    path: "product-management",
    icon: <BookOpen size={18} />,
    element: <ProductManagement />,
  },
  {
    name: "Order Management",
    path: "order-management",
    icon: <ShoppingBag size={18} />,
    element: <OrderManagement />,
  },
  {
    name: "Profile",
    path: "admin-profile",
    icon: <UserCircle size={18} />,
    element: <AdminProfile />,
  },
];

