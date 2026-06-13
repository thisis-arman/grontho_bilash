import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { logout, selectCurrentUser, TUser } from '../../../redux/features/auth/authSlice';
import { adminPaths } from '../../../routes/admin.route';
import { userPaths } from '../../../routes/user.route';
import { LogOut, Menu, X, ChevronDown } from 'lucide-react';

interface Props {
  onMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

const DashboardTopNav = ({ onMenuToggle, mobileMenuOpen }: Props) => {
  const user = useAppSelector(selectCurrentUser) as TUser;
  const { role, name, email } = user;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const ROLE = { ADMIN: 'admin', USER: 'user' };
  const navPaths = role === ROLE.ADMIN ? adminPaths : userPaths;
  const rolePrefix = role === ROLE.ADMIN ? '/admin' : '/user';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <img
              src="https://res.cloudinary.com/dshjcmrd0/image/upload/v1771834927/grontho-bilash-transparent.png.png"
              className="h-9 w-9"
              alt="Grontho Bilash"
            />
            <span className="hidden sm:block font-semibold text-gray-900 text-sm">
              Grontho Bilash
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navPaths.map((item) => (
              <NavLink
                key={item.path}
                to={`${rolePrefix}/${item.path}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-50 text-amber-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:block relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-sm">
                  {name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 leading-none">
                    {name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{role}</p>
                </div>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500 truncate">{email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            <div className="lg:hidden w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-sm">
              {name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardTopNav;