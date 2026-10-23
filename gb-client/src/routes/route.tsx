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
import Loader from "../components/ui/Loader";

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
const BookListEditor = lazy(() => import("../pages/dashboard/adminDashboard/content/BookListEditor"));
const BookListFinder = lazy(() => import("../pages/booklists/BookListFinder"));
const BookListDetail = lazy(() => import("../pages/booklists/BookListDetail"));
const CourseCatalog = lazy(() => import("../pages/courses/CourseCatalog"));
const DepartmentCourses = lazy(() => import("../pages/courses/DepartmentCourses"));
const CurriculumEditor = lazy(() => import("../pages/dashboard/adminDashboard/content/CurriculumEditor"));
const GpaCalculator = lazy(() => import("../pages/tools/GpaCalculator"));
const GradeConverter = lazy(() => import("../pages/tools/GradeConverter"));
const AgeCalculator = lazy(() => import("../pages/tools/AgeCalculator"));
const Reader = lazy(() => import("../pages/library/Reader"));


const pageFallback = <Loader delay={250} />;
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
                path: '/questions',
                element: <SuggestionList kind="question" />
            },
            {
                path: '/questions/:slug',
                element: <SuggestionDetail kind="question" />
            },
            {
                path: '/booklists',
                element: <BookListFinder />
            },
            {
                path: '/booklists/:slug',
                element: <BookListDetail />
            },
            {
                path: '/courses',
                element: <CourseCatalog />
            },
            {
                path: '/courses/:slug',
                element: <DepartmentCourses />
            },
            {
                path: '/careers',
                element: <><PageMeta title="ক্যারিয়ার" description="গ্রন্থবিলাসের সাথে কাজ করো, বাংলাদেশের শিক্ষার্থীদের কম খরচে দরকারি বই পেতে সাহায্য করো।" /><Careers /></>
            },
            {
                path: '/terms',
                element: <><PageMeta title="ব্যবহারের শর্তাবলি" description="গ্রন্থবিলাসে বই কেনা, বিক্রি ও সাইট ব্যবহারের শর্তাবলি।" /><TermsOfUse /></>
            },
            {
                path: '/privacy',
                element: <><PageMeta title="গোপনীয়তা নীতি" description="গ্রন্থবিলাস কীভাবে তোমার তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষা করে।" /><PrivacyPolicy /></>
            },
            {
                path: '/faq',
                element: <><PageMeta title="সাধারণ জিজ্ঞাসা (FAQ)" description="পুরনো বই কেনা-বেচা, ডেলিভারি চার্জ, বিকাশ ও ক্যাশ অন ডেলিভারি পেমেন্ট আর অ্যাকাউন্ট নিয়ে সাধারণ প্রশ্নের উত্তর।" /><FAQ /></>
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
                element: <><PageMeta title="BBA ফাইনাল পরীক্ষার সাজেশন" description="অধ্যায়ভিত্তিক BBA ফাইনাল পরীক্ষার সাজেশন, গুরুত্বপূর্ণ প্রশ্ন চিহ্নিত করা।" /><ExamSuggestions /></>
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
                    { path: 'gpa-calculator', element: <GpaCalculator /> },
                    { path: 'grade-converter', element: <GradeConverter /> },
                    { path: 'age-calculator', element: <AgeCalculator /> },
                ]
            }
        ]
    },
    {
        path: "*",
        element: <><PageMeta title="পেজটা পাওয়া যায়নি" noindex /><NotFound /></>
    },
    // Full-screen reader for a bought digital book (no site header).
    {
        path: '/read/:productId',
        errorElement: <RouteError />,
        element: <PrivateRoute>
            {lazyPage(<Reader />)}
        </PrivateRoute>,
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
            { path: 'questions/new', element: <SuggestionEditor kind="question" /> },
            { path: 'questions/:id/edit', element: <SuggestionEditor kind="question" /> },
            { path: 'booklists/new', element: <BookListEditor /> },
            { path: 'booklists/:id/edit', element: <BookListEditor /> },
            { path: 'curriculum/new', element: <CurriculumEditor /> },
            { path: 'curriculum/:id/edit', element: <CurriculumEditor /> },
        ]
    },
    {
        path: '/login',
        element: <><PageMeta title="লগইন" noindex />{lazyPage(<Login />)}</>
    },
    {
        path: '/forgot-password',
        element: <><PageMeta title="পাসওয়ার্ড রিসেট" noindex />{lazyPage(<ForgotPassword />)}</>
    },
    {
        path: '/signup',
        element: <><PageMeta title="অ্যাকাউন্ট খোলো" noindex />{lazyPage(<SignUp />)}</>
    }
]);


export default router;