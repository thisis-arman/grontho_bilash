import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout, selectCurrentUser, TUser } from "../redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getProductsFromCart } from "../../src/redux/features/cart/cartSlice";
import { ShoppingCart, Menu, X, LogOut, LogIn } from "lucide-react";

const Navbar = () => {
    const user = useAppSelector(selectCurrentUser) as TUser;
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const cartItems = useAppSelector(getProductsFromCart);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const navigation = [
        { title: "Home", path: "/" },
        { title: "Books", path: "/books" },
        { title: "Suggestions", path: "/exam-suggestions" },
        { title: "Tools", path: "/tools/cgpa-calculator" },
    ];

    
    // Add dashboard conditionally
    if (user) {
        navigation.push({ title: "Dashboard", path: `/${user?.role}/dashboard` });
    }

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    // Handle scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const isActive = (path: string) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    return (
        <header 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled 
                    ? "bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm py-2" 
                    : "bg-white/50 backdrop-blur-sm border-b border-transparent py-4"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <img
                            src="https://res.cloudinary.com/dshjcmrd0/image/upload/v1771834927/grontho-bilash-transparent.png.png"
                            alt="Grontho Bilash"
                            className="h-8 w-auto object-contain transition-transform hover:scale-105"
                        />
                        <span className="font-bold text-2xl hidden sm:block text-gray-900 tracking-tight">
                            Grontho<span className="text-yellow-500">Bilash</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navigation.map((item, idx) => (
                            <Link 
                                key={idx} 
                                to={item.path}
                                className={`text-sm font-semibold transition-colors duration-200 ${
                                    isActive(item.path) 
                                        ? 'text-yellow-600' 
                                        : 'text-gray-600 hover:text-yellow-500'
                                }`}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-5">
                        {user && (
                            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-yellow-500 transition-colors group">
                                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {cartItems.length > 0 && (
                                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm border-2 border-white">
                                        {cartItems.length}
                                    </span>
                                )}
                            </Link>
                        )}

                        {user ? (
                            <button 
                                onClick={handleLogout} 
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 transition-all border border-gray-200 hover:border-gray-300"
                            >
                                <LogOut className="w-4 h-4 text-gray-500" />
                                <span>Log out</span>
                            </button>
                        ) : (
                            <Link 
                                to="/login" 
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-yellow-500 rounded-full hover:bg-yellow-600 transition-all shadow-[0_4px_14px_0_rgba(234,179,8,0.39)] hover:shadow-[0_6px_20px_rgba(234,179,8,0.23)] hover:-translate-y-0.5"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Sign In</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Controls (Menu Toggle & Cart) */}
                    <div className="flex items-center gap-4 md:hidden">
                        {user && (
                            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-yellow-600 transition-colors">
                                <ShoppingCart className="w-6 h-6" />
                                {cartItems.length > 0 && (
                                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-sm border-2 border-white">
                                        {cartItems.length}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 -mr-2 text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors focus:outline-none"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu Dropdown */}
            <div 
                className={`md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-2xl transition-all duration-300 ease-in-out origin-top ${
                    isMenuOpen ? "opacity-100 scale-y-100 visible" : "opacity-0 scale-y-95 invisible pointer-events-none"
                }`}
            >
                <div className="flex flex-col px-4 py-4 space-y-2 max-h-[calc(100vh-5rem)] overflow-y-auto">
                    {navigation.map((item, idx) => (
                        <Link 
                            key={idx} 
                            to={item.path}
                            className={`block px-5 py-3.5 rounded-2xl text-base font-semibold transition-all ${
                                isActive(item.path) 
                                    ? 'bg-yellow-50 text-yellow-700' 
                                    : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {item.title}
                        </Link>
                    ))}
                    
                    <div className="pt-4 mt-2 border-t border-gray-100">
                        {user ? (
                            <button 
                                onClick={handleLogout} 
                                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 text-base font-semibold text-red-600 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Log out</span>
                            </button>
                        ) : (
                            <Link 
                                to="/login" 
                                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 text-base font-bold text-white bg-yellow-500 rounded-2xl hover:bg-yellow-600 transition-colors shadow-md"
                            >
                                <LogIn className="w-5 h-5" />
                                <span>Sign In</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;