import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../../redux/hooks';
import { selectCurrentUser, TUser } from '../../../redux/features/auth/authSlice';
import { adminPaths } from '../../../routes/admin.route';
import { userPaths } from '../../../routes/user.route';

interface Props {
  onClose: () => void;
}

const DashboardMobileMenu = ({ onClose }: Props) => {
  const { role } = useAppSelector(selectCurrentUser) as TUser;
  const ROLE = { ADMIN: 'admin', USER: 'user' };
  const navPaths = role === ROLE.ADMIN ? adminPaths : userPaths;
  const rolePrefix = role === ROLE.ADMIN ? '/admin' : '/user';

  return (
    <div className="px-4 py-3 space-y-1 ">
      {navPaths.map((item) => (
        <NavLink
          key={item.path}
          to={`${rolePrefix}/${item.path}`}
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isActive ? 'bg-amber-50 text-amber-700' : 'text-gray-700 hover:bg-gray-50'
            }`
          }
        >
          {item.icon}
          {item.name}
        </NavLink>
      ))}
    </div>
  );
};

export default DashboardMobileMenu;