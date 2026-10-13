import { Outlet, useLocation } from "react-router-dom";
import Footer from "../../shared/Footer";
import { Nav } from "../../shared/Navbar";
import { useAppSelector } from "../../redux/hooks";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import ScrollToTop from "../../utils/ScrollToTop";

const MainLayout = () => {
    const user = useAppSelector(selectCurrentUser);
    const { pathname } = useLocation();

    // The home page is dark; "dark" switches the navbar to its dark variant
    // there so it does not sit as a white strip above the hero.
    const isHome = pathname === "/";

    return (
        <div className={isHome ? "dark bg-stone-950" : ""}>
            <Nav />
            <ScrollToTop />
            <div className={`[-pt-16] ${user ? "pb-16 md:pb-0" : ""}`}>

                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

export default MainLayout;
