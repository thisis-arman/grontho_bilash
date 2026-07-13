"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Avatar, Dropdown, Space, MenuProps } from "antd";
import { UserOutlined } from "@ant-design/icons";
import {
  ShoppingCart,
  LogOut,
  LogIn,
  Home,
  BookOpen,
  Lightbulb,
  Calculator,
  LayoutDashboard,
} from "lucide-react";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "../components/ui/resizable-navbar";

import { logout, selectCurrentUser, TUser } from "../redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { getProductsFromCart } from "../redux/features/cart/cartSlice";

// ─── Public nav links (rendered via the resizable-navbar's NavItems) ───────
const publicNav = [
  { name: "Home", link: "/", icon: <Home size={18} /> },
  { name: "Books", link: "/books", icon: <BookOpen size={18} /> },
  { name: "Suggestions", link: "/exam-suggestions", icon: <Lightbulb size={18} /> },
  { name: "Tools", link: "/tools/cgpa-calculator", icon: <Calculator size={18} /> },
];

export function Nav() {
  const user = useAppSelector(selectCurrentUser) as TUser;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const cartItems = useAppSelector(getProductsFromCart);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  // Ant Design avatar dropdown items (desktop only)
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
        <button onClick={handleLogout} className="flex items-center gap-2 w-full text-red-600">
          <LogOut size={14} />
          Sign out
        </button>
      ),
    },
  ];

  const CartIcon = () => (
    <Link to="/cart" className="relative p-2 text-neutral-600 hover:text-yellow-500 transition-colors dark:text-neutral-300">
      <ShoppingCart className="w-5 h-5" />
      {cartItems.length > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-neutral-900">
          {cartItems.length}
        </span>
      )}
    </Link>
  );

  return (
    <div className="sticky top-0 z-50 w-full ">
      <Navbar>
        <NavBody>
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <img
              src="https://res.cloudinary.com/dshjcmrd0/image/upload/v1771834927/grontho-bilash-transparent.png.png"
              alt="Grontho Bilash"
              className="h-8 w-auto object-contain"
            />
            <span className="font-bold text-xl text-neutral-900 dark:text-white tracking-tight">
              Grontho<span className="text-yellow-500">Bilash</span>
            </span>
          </Link>

          <NavItems items={publicNav} />

          <div className="flex items-center gap-4">
            {user && <CartIcon />}

            {user ? (
              <>
                <Space>
                  <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
                    <Avatar icon={<UserOutlined />} className="cursor-pointer hover:opacity-80 transition-opacity" />
                  </Dropdown>
                </Space>
                <NavbarButton href={`/${user.role}/add-product`} variant="primary">
                  Sell
                </NavbarButton>
              </>
            ) : (
              <NavbarButton href="/login" variant="primary" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </NavbarButton>
            )}
          </div>
        </NavBody>

        {/* ── Mobile ── */}
        <MobileNav>
          <MobileNavHeader>
            <a href="/" className="flex items-center gap-2 cursor-pointer">
              <img
                src="https://res.cloudinary.com/dshjcmrd0/image/upload/v1771834927/grontho-bilash-transparent.png.png"
                alt="Grontho Bilash"
                className="h-7 w-auto object-contain"
              />
              <span className="font-bold text-lg text-neutral-900 dark:text-white tracking-tight">
                Grontho<span className="text-yellow-500">Bilash</span>
              </span>
            </a>
            <div className="flex items-center gap-2">
              {user && <CartIcon />}
              <MobileNavToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen((v) => !v)} />
            </div>
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
            {publicNav.map((item) => (
              <Link
                key={item.link}
                to={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 w-full px-2 py-2 rounded-xl text-base font-semibold transition-colors ${isActive(item.link)
                  ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10"
                  : "text-neutral-700 dark:text-neutral-300"
                  }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}

            {user && (
              <Link
                to={`/${user.role}/dashboard`}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 w-full px-2 py-2 rounded-xl text-base font-semibold transition-colors ${location.pathname.startsWith(`/${user.role}`)
                  ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10"
                  : "text-neutral-700 dark:text-neutral-300"
                  }`}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            )}

            <div className="flex w-full flex-col gap-3 pt-3 mt-1 border-t border-neutral-100 dark:border-neutral-800">
              {user ? (
                <>
                  <NavbarButton
                    href={`/${user.role}/add-product`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                  >
                    Sell
                  </NavbarButton>
                  <NavbarButton onClick={handleLogout} variant="secondary" className="w-full flex items-center justify-center gap-2">
                    <LogOut size={16} />
                    Log out
                  </NavbarButton>
                </>
              ) : (
                <NavbarButton
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <LogIn size={16} />
                  Sign In
                </NavbarButton>
              )}
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
}

export default Nav;