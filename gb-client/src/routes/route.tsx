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
import BookDetails from "../pages/books/ProductDetails";
import ShoppingCart from "../pages/cart/ShoppingCart";
import Checkout from "../pages/payment/Checkout";
import PaymentMain from "../pages/payment/PaymentMain";
import ExamSuggestions from "../pages/suggestions/ExamSuggestions";
import CgpaCalculator from "../pages/tools/cgpa-calculator/CgpaCalculator";
import FAQ from "../pages/faq/FAQ";
import ContactUs from "../pages/contact/ContactUs";
import AboutUs from "../pages/about/AboutUs";
import PrivacyPolicy from "../pages/privacypolicy/PrivacyPolicy";
import TermsOfUse from "../pages/Terms/TermsOfUse";

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
                path: '/terms',
                element: <TermsOfUse />
            },
            {
                path: '/privacy',
                element: <PrivacyPolicy />
            },
            {
                path: '/faq',
                element: <FAQ />
            },
            {
                path: '/about',
                element: <AboutUs />
            },
            {
                path: '/contact',
                element: <ContactUs />
            },
            
            {
                path: '/books',
                element: <Products />
            },
            {
                path: '/products/:slug',
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
            },
            {
                path: '/checkout/payment',
                element: <PrivateRoute>
                    <PaymentMain />
                </PrivateRoute>
            }, {
                path: '/success',
                element: <h1 className="mt-24 py-4 bg-green-600"> Payment successful</h1>
            },
            {
                path: '/exam-suggestions',
                element: <ExamSuggestions />
            },
            {
                path: '/tools/cgpa-calculator',
                element: <CgpaCalculator />
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