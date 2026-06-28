import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { logout, selectCurrentUser, TUser } from '../../../redux/features/auth/authSlice';
import { adminPaths } from '../../../routes/admin.route';
import { userPaths } from '../../../routes/user.route';
import { LogOut } from 'lucide-react';

const DashboardBottomNav = () => {
  const { role } = useAppSelector(selectCurrentUser) as TUser;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const ROLE = { ADMIN: 'admin', USER: 'user' };
  const navPaths = role === ROLE.ADMIN ? adminPaths : userPaths;
  const rolePrefix = role === ROLE.ADMIN ? '/admin' : '/user';

  const visibleItems = navPaths.slice(0, 5);

  const handleLogout = () => {
    dispatch(logout());
    
    navigate('/login');
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 block lg:hidden bg-white border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={`${rolePrefix}/${item.path}`}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors min-h-[56px] ${
                isActive ? 'text-amber-600 bg-amber-50' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
            <span className="truncate w-full text-center px-0.5 leading-tight">
              {/* {item.name.split(' ')[0]} */}
            </span>
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors min-h-[56px]"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default DashboardBottomNav;