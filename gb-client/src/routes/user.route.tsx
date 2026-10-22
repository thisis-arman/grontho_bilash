import {
  LayoutDashboard,
  PlusSquare,
  BookOpen,
  ShoppingBag,
  HandCoins,
  UserCircle,
  BellRing
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
const MyAlerts = lazy(() => import("../pages/dashboard/userDashboard/MyAlerts"));

// The first four entries are the ones shown in the phone tab bar.
export const userPaths: DashboardPath[] = [
    {
        name: "ওভারভিউ",
        path: "dashboard",
        icon: <LayoutDashboard size={18} />,
        element: <UserDashboard />,
    },
    {
        name: "আমার লিস্টিং",
        shortName: "লিস্টিং",
        path: "my-products",
        icon: <BookOpen size={18} />,
        element: <MyProducts />,
    },
    {
        name: "আমার অর্ডার",
        shortName: "অর্ডার",
        path: "my-orders",
        icon: <ShoppingBag size={18} />,
        element: <MyOrders />,
    },
    {
        name: "বই বিক্রি করো",
        shortName: "বিক্রি করো",
        path: "add-product",
        icon: <PlusSquare size={18} />,
        element: <ListProduct />,
    },
    {
        name: "আমার বিক্রি",
        shortName: "বিক্রি",
        path: "sales",
        icon: <HandCoins size={18} />,
        element: <MySales />,
    },
    {
        name: "আমার খোঁজ",
        shortName: "খোঁজ",
        path: "my-alerts",
        icon: <BellRing size={18} />,
        element: <MyAlerts />,
    },
    {
        name: "প্রোফাইল",
        path: "user-profile",
        icon: <UserCircle size={18} />,
        element: <ProfilePage />,
    },
];
