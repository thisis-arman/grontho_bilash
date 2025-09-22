import { Outlet } from "react-router-dom";
import Footer from "../../shared/Footer";
import Navbar from "../../shared/Navbar";


const MainLayout = () => {
    return (
        <div>
            <Navbar />
            <Outlet />
            <Footer />

        </div>
    );
};

export default MainLayout;