import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { HOME_BY_ROLE } from './navConfig';

export default function ProtectedRoute({ roles }) {
  const { currentUser } = useApp();

  if (!currentUser) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to={HOME_BY_ROLE[currentUser.role] || '/login'} replace />;
  }

  return <Outlet />;
}
