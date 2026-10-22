import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingBag,
  UserCircle,
  Newspaper,
  NotebookPen,
  FileQuestion,
  ListChecks,
  SearchCheck,
  GraduationCap
} from "lucide-react";
import { lazy } from "react";

// Loaded on demand; see user.route.tsx.
const AdminDashboard = lazy(() => import("../pages/dashboard/adminDashboard/AdminDashboard"));
const OrderManagement = lazy(() => import("../pages/dashboard/adminDashboard/OrderManagement"));
const ProductManagement = lazy(() => import("../pages/dashboard/adminDashboard/ProductManagement"));
const UserManagement = lazy(() => import("../pages/dashboard/adminDashboard/UserManagement"));
const ProfilePage = lazy(() => import("../pages/dashboard/ProfilePage"));
const BlogAdmin = lazy(() => import("../pages/dashboard/adminDashboard/content/BlogAdmin"));
const SuggestionAdmin = lazy(() => import("../pages/dashboard/adminDashboard/content/SuggestionAdmin"));
const QuestionAdmin = lazy(() => import("../pages/dashboard/adminDashboard/content/QuestionAdmin"));
const BookListAdmin = lazy(() => import("../pages/dashboard/adminDashboard/content/BookListAdmin"));
const SearchInsights = lazy(() => import("../pages/dashboard/adminDashboard/SearchInsights"));
const CurriculumAdmin = lazy(() => import("../pages/dashboard/adminDashboard/content/CurriculumAdmin"));

export interface DashboardPath {
  name: string;
  // Shorter label for the phone tab bar.
  shortName?: string;
  path: string;
  icon: JSX.Element;
  element: JSX.Element;
}

// The first four entries are the ones shown in the phone tab bar.
export const adminPaths: DashboardPath[] = [
  {
    name: "Overview",
    path: "dashboard",
    icon: <LayoutDashboard size={18} />,
    element: <AdminDashboard />,
  },
  {
    name: "Orders",
    path: "order-management",
    icon: <ShoppingBag size={18} />,
    element: <OrderManagement />,
  },
  {
    name: "Products",
    path: "product-management",
    icon: <BookOpen size={18} />,
    element: <ProductManagement />,
  },
  {
    name: "Users",
    path: "user-management",
    icon: <Users size={18} />,
    element: <UserManagement />,
  },
  {
    name: "Suggestions",
    path: "suggestions",
    icon: <NotebookPen size={18} />,
    element: <SuggestionAdmin />,
  },
  {
    name: "Question bank",
    path: "questions",
    icon: <FileQuestion size={18} />,
    element: <QuestionAdmin />,
  },
  {
    name: "Courses & syllabus",
    path: "curriculum",
    icon: <GraduationCap size={18} />,
    element: <CurriculumAdmin />,
  },
  {
    name: "Book lists",
    path: "booklists",
    icon: <ListChecks size={18} />,
    element: <BookListAdmin />,
  },
  {
    name: "Search insights",
    path: "search-insights",
    icon: <SearchCheck size={18} />,
    element: <SearchInsights />,
  },
  {
    name: "Blog",
    path: "blogs",
    icon: <Newspaper size={18} />,
    element: <BlogAdmin />,
  },
  {
    name: "Profile",
    path: "admin-profile",
    icon: <UserCircle size={18} />,
    element: <ProfilePage />,
  },
];
