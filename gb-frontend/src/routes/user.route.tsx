import AddProduct from "../pages/dashboard/userDashboard/AddProduct";
import History from "../pages/dashboard/userDashboard/History";
import MyOrders from "../pages/dashboard/userDashboard/MyOrders";
import MyProducts from "../pages/dashboard/userDashboard/MyProducts";
import UserDashboard from "../pages/dashboard/userDashboard/UserDashboard";
import UserProfile from "../pages/dashboard/userDashboard/UserProfile";



export const userPaths = [

    {
        name: "Dashboard",
        path: "dashboard",
        element: <UserDashboard />,
    },
    {
        name: "Add Product",
        path: "add-product",
        element: <AddProduct />,
    },
    {
        name: "My Products",
        path: "my-Products",
        element: <MyProducts />,
    },
    {
        name: "My Orders",
        path: "my-orders",
        element: <MyOrders />,
    },
    {
        name: "History",
        path: "history",
        element: <History />,
    },
    {
        name: "Profile",
        path: "user-profile",
        element: <UserProfile />,
    },
  
]