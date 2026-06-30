import { Outlet } from "react-router-dom";
import Footer from "../../shared/Footer";
import Navbar from "../../shared/Navbar";
import { useAppSelector } from "../../redux/hooks";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import ScrollToTop from "../../utils/ScrollToTop";

const MainLayout = () => {
    const user = useAppSelector(selectCurrentUser);

    return (
        <div>
            <Navbar />
            <ScrollToTop />
            <div className={`pt-16 ${user ? "pb-16 md:pb-0" : ""}`}>

                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

export default MainLayout;