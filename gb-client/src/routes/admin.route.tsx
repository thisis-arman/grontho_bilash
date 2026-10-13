import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingBag,
  UserCircle
} from "lucide-react";
import { lazy } from "react";

// Loaded on demand; see user.route.tsx.
const AdminDashboard = lazy(() => import("../pages/dashboard/adminDashboard/AdminDashboard"));
const OrderManagement = lazy(() => import("../pages/dashboard/adminDashboard/OrderManagement"));
const ProductManagement = lazy(() => import("../pages/dashboard/adminDashboard/ProductManagement"));
const UserManagement = lazy(() => import("../pages/dashboard/adminDashboard/UserManagement"));
const ProfilePage = lazy(() => import("../pages/dashboard/ProfilePage"));

export interface DashboardPath {
  name: string;
  // Shorter label for the phone tab bar.
  shortName?: string;
  path: string;
  icon: JSX.Element;
  element: JSX.Element;
}

// The first four entries are the ones shown in the phone tab bar.
export const adminPaths: DashboardPath[] = [
  {
    name: "Overview",
    path: "dashboard",
    icon: <LayoutDashboard size={18} />,
    element: <AdminDashboard />,
  },
  {
    name: "Orders",
    path: "order-management",
    icon: <ShoppingBag size={18} />,
    element: <OrderManagement />,
  },
  {
    name: "Products",
    path: "product-management",
    icon: <BookOpen size={18} />,
    element: <ProductManagement />,
  },
  {
    name: "Users",
    path: "user-management",
    icon: <Users size={18} />,
    element: <UserManagement />,
  },
  {
    name: "Profile",
    path: "admin-profile",
    icon: <UserCircle size={18} />,
    element: <ProfilePage />,
  },
];
