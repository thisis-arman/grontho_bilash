import { 
  LayoutDashboard, 
  PlusSquare, 
  BookOpen, 
  ShoppingBag, 
  History as HistoryIcon, 
  UserCircle 
} from "lucide-react";
import AddProduct from "../pages/dashboard/userDashboard/AddProduct";
import History from "../pages/dashboard/userDashboard/History";
import MyOrders from "../pages/dashboard/userDashboard/MyOrders";
import MyProducts from "../pages/dashboard/userDashboard/MyProducts";
import UserDashboard from "../pages/dashboard/userDashboard/UserDashboard";
import UserProfile from "../pages/dashboard/userDashboard/UserProfile";
import ListProduct from "../pages/books/ListProduct";


export const userPaths = [
    {
        name: "Dashboard",
        path: "dashboard",
        icon: <LayoutDashboard size={18} />,
        element: <UserDashboard />,
    },
    {
        name: "Add Product",
        path: "add-product",
        icon: <PlusSquare size={18} />,
        // element: <AddProduct />,
        element: <ListProduct />,
    },
    {
        name: "My Products",
        path: "my-Products",
        icon: <BookOpen size={18} />, // BookOpen looks slightly more modern than Book
        element: <MyProducts />,
    },
    {
        name: "My Orders",
        path: "my-orders",
        icon: <ShoppingBag size={18} />,
        element: <MyOrders />,
    },
    {
        name: "History",
        path: "history",
        icon: <HistoryIcon size={18} />,
        element: <History />,
    },
    {
        name: "Profile",
        path: "user-profile",
        icon: <UserCircle size={18} />,
        element: <UserProfile />,
    },
];