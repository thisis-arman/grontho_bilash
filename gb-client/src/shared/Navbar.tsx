"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  LogOut,
  LogIn,
  Home,
  BookOpen,
  Lightbulb,
  Newspaper,
  Calculator,
  LayoutDashboard,
  User,
  ListChecks,
  FileQuestion,
  GraduationCap,
} from "lucide-react";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "../components/ui/resizable-navbar";

import { signOut, selectCurrentUser, TUser } from "../redux/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { cartCount } from "../redux/features/cart/cartSlice";
import { TOOLS } from "../pages/tools/toolsList";
import ThemeToggle from "../theme/ThemeToggle";

const toggleClass = "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800";

// ─── Public nav links (rendered via the resizable-navbar's NavItems) ───────
const publicNav = [
  { name: "হোম", link: "/", icon: <Home size={18} /> },
  { name: "বই", link: "/books", icon: <BookOpen size={18} /> },
  {
    name: "পড়াশোনা",
    link: "/booklists",
    icon: <Lightbulb size={18} />,
    children: [
      { name: "সিলেবাস ও কোর্স", link: "/courses", icon: <GraduationCap size={16} /> },
      { name: "কোন বই লাগবে?", link: "/booklists", icon: <ListChecks size={16} /> },
      { name: "প্রশ্ন ব্যাংক", link: "/questions", icon: <FileQuestion size={16} /> },
      { name: "পরীক্ষার সাজেশন", link: "/suggestions", icon: <Lightbulb size={16} /> },
      { name: "ব্লগ ও বই রিভিউ", link: "/blogs", icon: <Newspaper size={16} /> },
    ],
  },
  {
    name: "টুলস",
    link: "/tools",
    icon: <Calculator size={18} />,
    children: TOOLS.map((tool) => ({
      name: tool.title,
      link: tool.path,
      icon: <tool.icon size={16} />,
    })),
  },
];

export function Nav() {
  const user = useAppSelector(selectCurrentUser) as TUser;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const bagCount = useAppSelector(cartCount);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(signOut());
    setIsMobileMenuOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false;
    return location.pathname.startsWith(path);
  };

  // Account menu items (desktop only).
  // Admins have their own area; the buying and selling pages live under
  // /user for everyone.
  const dashboardHome = user?.role === "user" ? "/user/dashboard" : "/admin/dashboard";
  const profilePath = user?.role === "user" ? "/user/user-profile" : "/admin/admin-profile";

  const accountLinks = [
    { to: dashboardHome, label: "ড্যাশবোর্ড" },
    { to: profilePath, label: "প্রোফাইল" },
    { to: "/user/my-orders", label: "আমার অর্ডার" },
  ];

  const CartIcon = () => (
    <Link to="/cart" className="relative p-2 text-neutral-600 hover:text-yellow-500 transition-colors dark:text-neutral-300">
      <ShoppingCart className="w-5 h-5" />
      {bagCount > 0 && (
        <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-neutral-900">
          {bagCount}
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
              src="/logo-96.png"
              width={32}
              height={32}
              alt="Grontho Bilash"
              className="h-8 w-auto object-contain"
            />
            <span className="font-bold text-xl text-neutral-900 dark:text-neutral-50 tracking-tight">
              গ্রন্থ<span className="text-yellow-500">বিলাস</span>
            </span>
          </Link>

          <NavItems items={publicNav} />

          <div className="flex items-center gap-4">
            <ThemeToggle className={toggleClass} />
            <CartIcon />

            {user ? (
              <>
                <AccountMenu links={accountLinks} onLogout={handleLogout} />
                <NavbarButton href="/user/add-product" variant="primary">
                  বিক্রি করো
                </NavbarButton>
              </>
            ) : (
              <NavbarButton href="/login" variant="primary" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                সাইন ইন
              </NavbarButton>
            )}
          </div>
        </NavBody>

        {/* ── Mobile ── */}
        <MobileNav>
          <MobileNavHeader>
            <a href="/" className="flex items-center gap-2 cursor-pointer">
              <img
                src="/logo-96.png"
              width={32}
              height={32}
                alt="Grontho Bilash"
                className="h-7 w-auto object-contain"
              />
              <span className="font-bold text-lg text-neutral-900 dark:text-neutral-50 tracking-tight">
                Grontho<span className="text-yellow-500">Bilash</span>
              </span>
            </a>
            <div className="flex items-center gap-2">
              <ThemeToggle className={toggleClass} />
              <CartIcon />
              <MobileNavToggle isOpen={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen((v) => !v)} />
            </div>
          </MobileNavHeader>

          <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
            {publicNav.map((item) => (
              <div key={item.link} className="w-full">
                <Link
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

                {/* Sub-links (the individual tools), indented under the parent. */}
                {"children" in item && item.children && (
                  <div className="mt-1 ml-4 border-l border-neutral-200 pl-3 dark:border-neutral-800">
                    {item.children.map((child) => (
                      <Link
                        key={child.link}
                        to={child.link}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 w-full px-2 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === child.link
                          ? "text-yellow-600"
                          : "text-neutral-600 dark:text-neutral-400"
                          }`}
                      >
                        {child.icon}
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {user && (
              <Link
                to={dashboardHome}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 w-full px-2 py-2 rounded-xl text-base font-semibold transition-colors ${(location.pathname.startsWith('/user') || location.pathname.startsWith('/admin'))
                  ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-500/10"
                  : "text-neutral-700 dark:text-neutral-300"
                  }`}
              >
                <LayoutDashboard size={18} />
                ড্যাশবোর্ড
              </Link>
            )}

            <div className="flex w-full flex-col gap-3 pt-3 mt-1 border-t border-neutral-100 dark:border-neutral-800">
              {user ? (
                <>
                  <NavbarButton
                    href="/user/add-product"
                    onClick={() => setIsMobileMenuOpen(false)}
                    variant="primary"
                    className="w-full"
                  >
                    বিক্রি করো
                  </NavbarButton>
                  <NavbarButton onClick={handleLogout} variant="secondary" className="w-full flex items-center justify-center gap-2">
                    <LogOut size={16} />
                    লগ আউট
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
                  সাইন ইন
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
// Small replacement for antd's Dropdown + Avatar, which pulled the whole antd
// library into the first download for one menu.
function AccountMenu({ links, onLogout }: { links: { to: string; label: string }[]; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const itemClass =
    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-neutral-700 transition hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="অ্যাকাউন্ট মেনু"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 transition hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:bg-neutral-700 dark:text-neutral-200"
      >
        <User size={16} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
        >
          {links.map((l) => (
            <Link key={l.to} to={l.to} role="menuitem" className={itemClass}>
              {l.label}
            </Link>
          ))}
          <div className="my-1 h-px bg-neutral-200 dark:bg-neutral-800" />
          <button type="button" role="menuitem" onClick={onLogout} className={`${itemClass} text-red-600 dark:text-red-400`}>
            <LogOut size={14} aria-hidden="true" />
            সাইন আউট
          </button>
        </div>
      )}
    </div>
  );
}
