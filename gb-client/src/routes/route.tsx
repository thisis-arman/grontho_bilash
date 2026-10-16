import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../components/layouts/MainLayout";
import Home from "../pages/home/Home";
import { routeGenerator } from "../utils/routeGenerator";
import { userPaths } from "./user.route";
import { adminPaths } from "./admin.route";
import PrivateRoute from "../components/layouts/PrivateRoute";
import NotFound from "../pages/404/NotFound";
import RouteError from "../pages/404/RouteError";
import { PageMeta } from "../utils/usePageMeta";

// Only the home page and the layout are in the first download; every other
// page loads when it is first visited, so visitors don't pay for the
// dashboard, editors, tools and checkout before they need them.
const Login = lazy(() => import("../pages/login/Login"));
const SignUp = lazy(() => import("../pages/signup/SignUp"));
const Dashboard = lazy(() => import("../components/layouts/Dashboard"));
const Products = lazy(() => import("../pages/books/Shop"));
const BookDetails = lazy(() => import("../pages/books/ProductDetails"));
const Cart = lazy(() => import("../pages/cart/Cart"));
const OrderSuccess = lazy(() => import("../pages/cart/OrderSuccess"));
const ForgotPassword = lazy(() => import("../pages/login/ForgotPassword"));
const ExamSuggestions = lazy(() => import("../pages/suggestions/ExamSuggestions"));
const CgpaCalculator = lazy(() => import("../pages/tools/cgpa-calculator/CgpaCalculator"));
const ToolsLayout = lazy(() => import("../pages/tools/ToolsLayout"));
const ToolsHub = lazy(() => import("../pages/tools/ToolsHub"));
const TargetCgpa = lazy(() => import("../pages/tools/TargetCgpa"));
const AttendanceCalculator = lazy(() => import("../pages/tools/AttendanceCalculator"));
const FocusTimer = lazy(() => import("../pages/tools/FocusTimer"));
const FAQ = lazy(() => import("../pages/faq/FAQ"));
const ContactUs = lazy(() => import("../pages/contact/ContactUs"));
const AboutUs = lazy(() => import("../pages/about/AboutUs"));
const PrivacyPolicy = lazy(() => import("../pages/privacypolicy/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("../pages/Terms/TermsOfUse"));
const Careers = lazy(() => import("../pages/careers/Careers"));
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
                element: <BlogList />
            },
            {
                path: '/blogs/:slug',
                element: <BlogPost />
            },
            {
                path: '/suggestions',
                element: <SuggestionList />
            },
            {
                path: '/suggestions/:slug',
                element: <SuggestionDetail />
            },
            {
                path: '/careers',
                element: <><PageMeta title="Careers" description="Work with Grontho Bilash and help students in Bangladesh get the books they need for less." /><Careers /></>
            },
            {
                path: '/terms',
                element: <><PageMeta title="Terms of use" description="The terms for buying, selling and using Grontho Bilash." /><TermsOfUse /></>
            },
            {
                path: '/privacy',
                element: <><PageMeta title="Privacy policy" description="How Grontho Bilash collects, uses and protects your information." /><PrivacyPolicy /></>
            },
            {
                path: '/faq',
                element: <><PageMeta title="Frequently asked questions" description="Answers about buying and selling used books, delivery, payment and accounts on Grontho Bilash." /><FAQ /></>
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
                element: <><PageMeta title="BBA final exam suggestions" description="Chapter-wise BBA final exam suggestions with the most important questions marked." /><ExamSuggestions /></>
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
        element: <><PageMeta title="Page not found" noindex /><NotFound /></>
    },
    {
        path: '/user',
        errorElement: <RouteError />,
        element: <PrivateRoute>
            {lazyPage(<Dashboard />)}
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
            {lazyPage(<Dashboard />)}
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
        element: <><PageMeta title="Log in" noindex />{lazyPage(<Login />)}</>
    },
    {
        path: '/forgot-password',
        element: <><PageMeta title="Reset your password" noindex />{lazyPage(<ForgotPassword />)}</>
    },
    {
        path: '/signup',
        element: <><PageMeta title="Create an account" noindex />{lazyPage(<SignUp />)}</>
    }
]);


export default router;