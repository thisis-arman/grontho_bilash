import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../components/layouts/MainLayout";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import SignUp from "../pages/signup/SignUp";
import Dashboard from "../components/layouts/Dashboard";
import { routeGenerator } from "../utils/routeGenerator";
import { userPaths } from "./user.route";
import { adminPaths } from "./admin.route";
import PrivateRoute from "../components/layouts/PrivateRoute";
import Blogs from "../pages/blog/blogs";
import Products from "../pages/books/new_products";
import BookDetails from "../pages/books/BookDetails";
import ShoppingCart from "../pages/cart/ShoppingCart";
import Checkout from "../pages/payment/Checkout";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: '/blogs',
                element: <Blogs />
            },
            {
                path: '/books',
                element: <Products />
            },
            {
                path: '/products/:id',
                element: <BookDetails />
            },
            {
                path: '/cart',
                element: <PrivateRoute>
                    <ShoppingCart />
                </PrivateRoute>
            },
            {
                path: '/checkout',
                element: <PrivateRoute>
                    <Checkout />
                </PrivateRoute>
            }
        ]
    },
    {
        path: '/user',
        element: <PrivateRoute>
            <Dashboard />
        </PrivateRoute>,
        children: routeGenerator(userPaths)
    },
    {
        path: '/admin',
        element: <PrivateRoute>
            <Dashboard />
        </PrivateRoute>,
        children: routeGenerator(adminPaths)
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