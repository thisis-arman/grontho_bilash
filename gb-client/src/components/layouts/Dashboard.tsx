import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Home, LogOut, Menu, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { signOut, selectCurrentUser, TUser } from '../../redux/features/auth/authSlice';
import { adminPaths } from '../../routes/admin.route';
import { userPaths } from '../../routes/user.route';

const LOGO = 'https://res.cloudinary.com/dshjcmrd0/image/upload/v1771834927/grontho-bilash-transparent.png.png';

// How many destinations fit in the phone tab bar next to "More".
const TAB_BAR_ITEMS = 4;

const sideLink = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
    isActive ? 'bg-amber-400 text-stone-950' : 'text-stone-300 hover:bg-white/10 hover:text-white'
  }`;

const quietLink =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400';

const Dashboard = () => {
  const user = useAppSelector(selectCurrentUser) as TUser;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The section comes from the URL, not the role: an admin can also use the
  // seller pages under /user.
  const isAdminArea = pathname.startsWith('/admin');
  const isAdmin = user?.role !== 'user';
  const prefix = isAdminArea ? '/admin' : '/user';
  const navPaths = isAdminArea ? adminPaths : userPaths;

  useEffect(() => setDrawerOpen(false), [pathname]);

  const handleLogout = () => {
    dispatch(signOut());
    navigate('/login');
  };

  // Shared by the desktop sidebar and the phone drawer.
  const navigation = (
    <>
      <nav aria-label="Dashboard" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          {isAdminArea ? 'Admin' : 'My account'}
        </p>
        {navPaths.map((item) => (
          <NavLink key={item.path} to={`${prefix}/${item.path}`} className={sideLink}>
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-3">
        {isAdmin && (
          <Link to={isAdminArea ? '/user/dashboard' : '/admin/dashboard'} className={quietLink}>
            <ArrowLeftRight size={18} aria-hidden="true" />
            {isAdminArea ? 'Seller view' : 'Admin view'}
          </Link>
        )}
        <Link to="/" className={quietLink}>
          <Home size={18} aria-hidden="true" />
          Back to site
        </Link>
        <button type="button" onClick={handleLogout} className={`${quietLink} hover:!bg-red-500/15 hover:!text-red-300`}>
          <LogOut size={18} aria-hidden="true" />
          Sign out
        </button>

        <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-stone-950">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-white">{user?.name || 'User'}</span>
            <span className="block truncate text-xs text-stone-400">{user?.email}</span>
          </span>
        </div>
      </div>
    </>
  );

  const brand = (
    <Link to="/" className="flex items-center gap-2.5">
      <img src={LOGO} alt="" className="h-8 w-8 object-contain" />
      <span className="font-display text-lg font-bold text-white">
        Grontho<span className="text-amber-400">Bilash</span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-stone-950 lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">{brand}</div>
        {navigation}
      </aside>

      {/* Phone / tablet top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-stone-950 px-4 lg:hidden">
        {brand}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <Menu size={22} aria-hidden="true" />
        </button>
      </header>

      {/* Phone / tablet drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${drawerOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!drawerOpen}
      >
        <div
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-stone-950/60 transition-opacity duration-200 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-stone-950 shadow-2xl transition-transform duration-200 ease-out ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          // Keeps hidden links out of the tab order while the drawer is closed.
          {...(drawerOpen ? {} : { inert: '' })}
        >
          <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
            {brand}
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition hover:bg-white/10"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          {navigation}
        </aside>
      </div>

      <main className="pb-24 lg:pb-10 lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Pages are lazy-loaded; keep the shell on screen while one arrives. */}
          <Suspense
            fallback={
              <div className="flex justify-center py-24" role="status" aria-label="Loading">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-amber-400" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </main>

      {/* Phone / tablet tab bar */}
      <nav
        aria-label="Quick navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-stone-200 bg-white lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navPaths.slice(0, TAB_BAR_ITEMS).map((item) => (
          <NavLink
            key={item.path}
            to={`${prefix}/${item.path}`}
            className={({ isActive }) =>
              `flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition-colors ${
                isActive ? 'text-amber-600' : 'text-stone-500'
              }`
            }
          >
            {item.icon}
            <span className="w-full truncate text-center">{item.shortName ?? item.name}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold text-stone-500"
        >
          <Menu size={18} aria-hidden="true" />
          More
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;
