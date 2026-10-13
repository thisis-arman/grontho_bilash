import {
  LayoutDashboard,
  PlusSquare,
  BookOpen,
  ShoppingBag,
  HandCoins,
  UserCircle
} from "lucide-react";
import { lazy } from "react";
import type { DashboardPath } from "./admin.route";

// Dashboard pages are only needed after login, so they load on demand
// instead of being part of the first download every visitor makes.
const MyOrders = lazy(() => import("../pages/dashboard/userDashboard/MyOrders"));
const MyProducts = lazy(() => import("../pages/dashboard/userDashboard/MyProducts"));
const MySales = lazy(() => import("../pages/dashboard/userDashboard/MySales"));
const UserDashboard = lazy(() => import("../pages/dashboard/userDashboard/UserDashboard"));
const ProfilePage = lazy(() => import("../pages/dashboard/ProfilePage"));
const ListProduct = lazy(() => import("../pages/books/ListProduct"));

// The first four entries are the ones shown in the phone tab bar.
export const userPaths: DashboardPath[] = [
    {
        name: "Overview",
        path: "dashboard",
        icon: <LayoutDashboard size={18} />,
        element: <UserDashboard />,
    },
    {
        name: "My Listings",
        shortName: "Listings",
        path: "my-products",
        icon: <BookOpen size={18} />,
        element: <MyProducts />,
    },
    {
        name: "My Orders",
        shortName: "Orders",
        path: "my-orders",
        icon: <ShoppingBag size={18} />,
        element: <MyOrders />,
    },
    {
        name: "Sell a Book",
        shortName: "Sell",
        path: "add-product",
        icon: <PlusSquare size={18} />,
        element: <ListProduct />,
    },
    {
        name: "Sales",
        path: "sales",
        icon: <HandCoins size={18} />,
        element: <MySales />,
    },
    {
        name: "Profile",
        path: "user-profile",
        icon: <UserCircle size={18} />,
        element: <ProfilePage />,
    },
];
