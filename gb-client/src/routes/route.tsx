import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../components/layouts/MainLayout";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import SignUp from "../pages/signup/SignUp";
import Dashboard from "../components/layouts/Dashboard";
import { routeGenerator } from "../utils/routeGenerator";
import { userPaths } from "./user.route";
import { adminPaths } from "./admin.route";
import PrivateRoute from "../components/layouts/PrivateRoute";
import Products from "../pages/books/Shop";
import BookDetails from "../pages/books/ProductDetails";
import Cart from "../pages/cart/Cart";
import OrderSuccess from "../pages/cart/OrderSuccess";
import ForgotPassword from "../pages/login/ForgotPassword";
import ExamSuggestions from "../pages/suggestions/ExamSuggestions";
import CgpaCalculator from "../pages/tools/cgpa-calculator/CgpaCalculator";
import ToolsLayout from "../pages/tools/ToolsLayout";
import ToolsHub from "../pages/tools/ToolsHub";
import TargetCgpa from "../pages/tools/TargetCgpa";
import AttendanceCalculator from "../pages/tools/AttendanceCalculator";
import FocusTimer from "../pages/tools/FocusTimer";
import FAQ from "../pages/faq/FAQ";
import ContactUs from "../pages/contact/ContactUs";
import AboutUs from "../pages/about/AboutUs";
import PrivacyPolicy from "../pages/privacypolicy/PrivacyPolicy";
import TermsOfUse from "../pages/Terms/TermsOfUse";
import NotFound from "../pages/404/NotFound";
import RouteError from "../pages/404/RouteError";
import Careers from "../pages/careers/Careers";

// Content pages load on demand: the Markdown renderer is only needed there.
const BlogList = lazy(() => import("../pages/blog/BlogList"));
const BlogPost = lazy(() => import("../pages/blog/BlogPost"));
const SuggestionList = lazy(() => import("../pages/suggestions/SuggestionList"));
const SuggestionDetail = lazy(() => import("../pages/suggestions/SuggestionDetail"));
const BlogEditor = lazy(() => import("../pages/dashboard/adminDashboard/content/BlogEditor"));
const SuggestionEditor = lazy(() => import("../pages/dashboard/adminDashboard/content/SuggestionEditor"));

const pageFallback = <div className="min-h-[60vh]" aria-busy="true" />;
const lazyPage = (page: JSX.Element) => <Suspense fallback={pageFallback}>{page}</Suspense>;

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        errorElement: <RouteError />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: '/blogs',
                element: lazyPage(<BlogList />)
            },
            {
                path: '/blogs/:slug',
                element: lazyPage(<BlogPost />)
            },
            {
                path: '/suggestions',
                element: lazyPage(<SuggestionList />)
            },
            {
                path: '/suggestions/:slug',
                element: lazyPage(<SuggestionDetail />)
            },
            {
                path: '/careers',
                element: <Careers />
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
            // The bag is open to guests; placing the order asks them to log in.
            {
                path: '/cart',
                element: <Cart />
            },
            {
                path: '/checkout/success',
                element: <PrivateRoute>
                    <OrderSuccess />
                </PrivateRoute>
            },
            // Checkout happens on the cart page; these old URLs just forward there.
            {
                path: '/checkout',
                element: <Navigate to="/cart" replace />
            },
            {
                path: '/checkout/payment',
                element: <Navigate to="/cart" replace />
            },
            {
                path: '/exam-suggestions',
                element: <ExamSuggestions />
            },
            {
                path: '/tools',
                element: <ToolsLayout />,
                children: [
                    { index: true, element: <ToolsHub /> },
                    { path: 'cgpa-calculator', element: <CgpaCalculator /> },
                    { path: 'target-cgpa', element: <TargetCgpa /> },
                    { path: 'attendance', element: <AttendanceCalculator /> },
                    { path: 'focus-timer', element: <FocusTimer /> },
                ]
            }
        ]
    },
    {
        path: "*",
        element: <NotFound />
    },
    {
        path: '/user',
        errorElement: <RouteError />,
        element: <PrivateRoute>
            <Dashboard />
        </PrivateRoute>,
        children: [
            { index: true, element: <Navigate to="/user/dashboard" replace /> },
            ...routeGenerator(userPaths),
            // "History" was replaced by the Sales page.
            { path: 'history', element: <Navigate to="/user/sales" replace /> },
        ]
    },
    {
        path: '/admin',
        errorElement: <RouteError />,
        element: <PrivateRoute roles={["admin", "superAdmin"]}>
            <Dashboard />
        </PrivateRoute>,
        children: [
            { index: true, element: <Navigate to="/admin/dashboard" replace /> },
            ...routeGenerator(adminPaths),
            // Editors are reached from the Blog / Suggestions lists, not the menu.
            { path: 'blogs/new', element: <BlogEditor /> },
            { path: 'blogs/:id/edit', element: <BlogEditor /> },
            { path: 'suggestions/new', element: <SuggestionEditor /> },
            { path: 'suggestions/:id/edit', element: <SuggestionEditor /> },
        ]
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />
    },
    {
        path: '/signup',
        element: <SignUp />
    }
]);


export default router;