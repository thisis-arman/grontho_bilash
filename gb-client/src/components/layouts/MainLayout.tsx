import { Suspense } from "react";
import Loader from "../ui/Loader";
import { Outlet } from "react-router-dom";
import Footer from "../../shared/Footer";
import { Nav } from "../../shared/Navbar";
import { useAppSelector } from "../../redux/hooks";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import ScrollToTop from "../../utils/ScrollToTop";
import { useCanonicalUrl } from "../../utils/usePageMeta";
import InstallBanner from "../../pwa/InstallBanner";

const MainLayout = () => {
    const user = useAppSelector(selectCurrentUser);
    useCanonicalUrl();
    return (
        <div>
            <Nav />
            <ScrollToTop />
            <div className={`[-pt-16] ${user ? "pb-16 md:pb-0" : ""}`}>
                {/* Pages are loaded on demand (see routes/route.tsx). */}
                <Suspense fallback={<Loader delay={250} />}>
                    <Outlet />
                </Suspense>
            </div>
            <Footer />
            <InstallBanner />
        </div>
    );
};

export default MainLayout;
