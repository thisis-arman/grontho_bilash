import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/layouts/MainLayout";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import SignUp from "../pages/signup/SignUp";
import Dashboard from "../components/layouts/Dashboard";
import AddProduct from "../pages/dashboard/userDashboard/AddProduct";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Home />
            }
        ]
    },
    {
        path: '/admin',
        element: <Dashboard />,
        children: [
            {
                path: 'add-product',
                element: <AddProduct />
            }
        ]
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/signup',
        element: <SignUp />
    }
]);


export default router;