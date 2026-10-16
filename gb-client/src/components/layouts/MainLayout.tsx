import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../../shared/Footer";
import { Nav } from "../../shared/Navbar";
import { useAppSelector } from "../../redux/hooks";
import { selectCurrentUser } from "../../redux/features/auth/authSlice";
import ScrollToTop from "../../utils/ScrollToTop";
import { useCanonicalUrl } from "../../utils/usePageMeta";

const MainLayout = () => {
    const user = useAppSelector(selectCurrentUser);
    useCanonicalUrl();
    return (
        <div>
            <Nav />
            <ScrollToTop />
            <div className={`[-pt-16] ${user ? "pb-16 md:pb-0" : ""}`}>
                {/* Pages are loaded on demand (see routes/route.tsx). */}
                <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
                    <Outlet />
                </Suspense>
            </div>
            <Footer />
        </div>
    );
};

export default MainLayout;
