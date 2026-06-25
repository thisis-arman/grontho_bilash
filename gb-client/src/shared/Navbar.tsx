import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout, selectCurrentUser, TUser } from "../redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getProductsFromCart } from "../redux/features/cart/cartSlice";
import { userPaths } from "../routes/user.route";
import { adminPaths } from "../routes/admin.route";
import {
  ShoppingCart,
  Menu,
  X,
  LogOut,
  LogIn,
  Home,
  BookOpen,
  Lightbulb,
  Calculator,
  LayoutDashboard,
} from "lucide-react";
import { Avatar, Dropdown, Space, MenuProps } from "antd";
import { UserOutlined } from "@ant-design/icons";

// ─── Public top navigation links ─────────────────────────────────────────────
const publicNav = [
  { title: "Home", path: "/", icon: <Home size={20} /> },
  { title: "Books", path: "/books", icon: <BookOpen size={20} /> },
  { title: "Suggestions", path: "/exam-suggestions", icon: <Lightbulb size={20} /> },
  { title: "Tools", path: "/tools/cgpa-calculator", icon: <Calculator size={20} /> },
];

// ─── Bottom nav for logged-in users, INSIDE the dashboard only — max 5 items ─
const MAX_BOTTOM_ITEMS = 5;

const Navbar = () => {
  const user = useAppSelector(selectCurrentUser) as TUser;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const cartItems = useAppSelector(getProductsFromCart);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Build dashboard nav items for the dashboard's own bottom bar
  const dashPaths = user?.role === "admin" ? adminPaths : userPaths;
  const rolePrefix = user?.role === "admin" ? "/admin" : "/user";
  const dashboardBottomNavItems = dashPaths.slice(0, MAX_BOTTOM_ITEMS);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  // Ant Design avatar dropdown items
  const dropdownItems: MenuProps["items"] = [
    {
      key: "dashboard",
      label: <Link to={`/${user?.role}/dashboard`}>Dashboard</Link>,
    },
    {
      key: "profile",
      label: <Link to={`/${user?.role}/user-profile`}>Profile</Link>,
    },
    {
      key: "orders",
      label: <Link to={`/${user?.role}/my-orders`}>My Orders</Link>,
    },
    { type: "divider" },
    {
      key: "logout",
      label: (
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full text-red-600"
        >
          <LogOut size={14} />
          Sign out
        </button>
      ),
    },
  ];

  // ─── Whether we're inside the dashboard ──────────────────────────────────
  // This is the single source of truth for which bottom bar renders.
  // Dashboard menu items must ONLY ever be reachable from here — a user
  // browsing Home/Books/etc. should never see dashboard options at all.
  const inDashboard =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/user");

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          TOP NAVBAR — always visible on desktop; compact on mobile
      ═══════════════════════════════════════════════════════════════════ */}
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

            {/* ── Desktop public nav ── */}
            <nav className="hidden md:flex items-center gap-8">
              {publicNav.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive(item.path)
                      ? "text-yellow-600"
                      : "text-gray-600 hover:text-yellow-500"
                  }`}
                >
                  {item.title}
                </Link>
              ))}
              {user && (
                <Link
                  to={`/${user.role}/dashboard`}
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    inDashboard
                      ? "text-yellow-600"
                      : "text-gray-600 hover:text-yellow-500"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            {/* ── Desktop actions ── */}
            <div className="hidden md:flex items-center gap-5">
              {user && (
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-600 hover:text-yellow-500 transition-colors group"
                >
                  <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  {cartItems.length > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                <>
                  <Space>
                    <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
                      <Avatar
                        icon={<UserOutlined />}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </Dropdown>
                  </Space>
                  <Link
                    to={`/${user.role}/add-product`}
                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-yellow-500 rounded-md hover:bg-yellow-600 transition-all shadow-[0_4px_14px_0_rgba(234,179,8,0.39)] hover:-translate-y-0.5"
                  >
                    Sell
                  </Link>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-yellow-500 rounded-full hover:bg-yellow-600 transition-all shadow-[0_4px_14px_0_rgba(234,179,8,0.39)] hover:-translate-y-0.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* ── Mobile top-right: cart + hamburger ── */}
            <div className="flex items-center gap-3 md:hidden">
              {user && (
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-700 hover:text-yellow-600 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItems.length > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 -mr-2 text-gray-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile slide-down menu (hamburger — public pages only) ── */}
        <div
          className={`md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-2xl transition-all duration-300 ease-in-out origin-top ${
            mobileMenuOpen
              ? "opacity-100 scale-y-100 visible"
              : "opacity-0 scale-y-95 invisible pointer-events-none"
          }`}
        >
          <div className="flex flex-col px-4 py-4 space-y-1 max-h-[calc(100vh-5rem)] overflow-y-auto">
            {publicNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition-all ${
                  isActive(item.path)
                    ? "bg-yellow-50 text-yellow-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}

            <div className="pt-3 mt-1 border-t border-gray-100">
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

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE BOTTOM NAV — exactly ONE of these two renders at a time,
          decided purely by `inDashboard`. A user on Home/Books/Suggestions/
          Tools/Cart/Login etc. must NEVER see dashboard menu items here —
          only once they've actually navigated into /admin or /user does
          the dashboard's own bottom bar take over.
      ═══════════════════════════════════════════════════════════════════ */}
      {inDashboard ? (
        /* ── DASHBOARD bottom bar — only inside /admin or /user ── */
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-stretch">
            {dashboardBottomNavItems.map((item) => {
              const to = `${rolePrefix}/${item.path}`;
              return (
                <NavLink
                  key={item.path}
                  to={to}
                  className={({ isActive }) =>
                    `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[10px] font-semibold transition-colors relative ${
                      isActive
                        ? "text-yellow-600 bg-yellow-50"
                        : "text-gray-400 hover:text-gray-600"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-yellow-500 rounded-full" />
                      )}
                      <span className={`transition-transform duration-150 ${isActive ? "scale-110" : ""}`}>
                        {item.icon}
                      </span>
                      <span className="truncate w-full text-center px-1">
                        {/* Shorten long labels for small screens */}
                        {/* {item.name} */}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* Cart tab — only for regular users (not admin) */}
            {user?.role !== "admin" && (
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[10px] font-semibold transition-colors relative ${
                    isActive
                      ? "text-yellow-600 bg-yellow-50"
                      : "text-gray-400 hover:text-gray-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-yellow-500 rounded-full" />
                    )}
                    <span className="relative">
                      <ShoppingCart size={20} />
                      {cartItems.length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full">
                          {cartItems.length}
                        </span>
                      )}
                    </span>
                  </>
                )}
              </NavLink>
            )}

            {/* Logout tab */}
            <button
              onClick={handleLogout}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[10px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      ) : (
        /* ── PUBLIC bottom bar — everywhere else (Home, Books, Cart, etc.)
             Always visible regardless of auth state. Logged-in users get
             Home / Books / Dashboard / Cart / Logout. Logged-out visitors
             get Home / Books / Login — dashboard, cart, and logout have
             no meaning for a guest, so they're left out rather than padded
             with placeholders. ── */
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-stretch">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[10px] font-semibold transition-colors relative ${
                  isActive
                    ? "text-yellow-600 bg-yellow-50"
                    : "text-gray-400 hover:text-gray-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-yellow-500 rounded-full" />
                  )}
                  <Home size={20} />
                  <span>Home</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/books"
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[10px] font-semibold transition-colors relative ${
                  isActive
                    ? "text-yellow-600 bg-yellow-50"
                    : "text-gray-400 hover:text-gray-600"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-yellow-500 rounded-full" />
                  )}
                  <BookOpen size={20} />
                  <span>Books</span>
                </>
              )}
            </NavLink>

            {user ? (
              <>
                <NavLink
                  to={`/${user.role}/dashboard`}
                  className={({ isActive }) =>
                    `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[10px] font-semibold transition-colors relative ${
                      isActive
                        ? "text-yellow-600 bg-yellow-50"
                        : "text-gray-400 hover:text-gray-600"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-yellow-500 rounded-full" />
                      )}
                      <LayoutDashboard size={20} />
                      <span>Dashboard</span>
                    </>
                  )}
                </NavLink>

                {user.role !== "admin" && (
                  <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                      `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[10px] font-semibold transition-colors relative ${
                        isActive
                          ? "text-yellow-600 bg-yellow-50"
                          : "text-gray-400 hover:text-gray-600"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-yellow-500 rounded-full" />
                        )}
                        <span className="relative">
                          <ShoppingCart size={20} />
                          {cartItems.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full">
                              {cartItems.length}
                            </span>
                          )}
                        </span>
                        <span>Cart</span>
                      </>
                    )}
                  </NavLink>
                )}

                <button
                  onClick={handleLogout}
                  className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[10px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[10px] font-semibold transition-colors relative ${
                    isActive
                      ? "text-yellow-600 bg-yellow-50"
                      : "text-gray-400 hover:text-gray-600"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-yellow-500 rounded-full" />
                    )}
                    <LogIn size={20} />
                    <span>Sign In</span>
                  </>
                )}
              </NavLink>
            )}
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;