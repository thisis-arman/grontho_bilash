
import AdminDashboard from "../pages/dashboard/adminDashboard/AdminDashboard";
import AdminProfile from "../pages/dashboard/adminDashboard/AdminProfile";


export const adminPaths = [
  {
    name: "Dashboard",
    path: "dashboard",
    element: <AdminDashboard/>,
  },
  {
    name: "Profile",
    path: "admin-profile",
    element: <AdminProfile/>,
  },
];

