import { Navigate, Outlet } from 'react-router-dom';
import { ReactNode } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { Loading } from '../loading';
import { useRole } from '../../hooks/useRole';

type ProtectedRouteProps = {
  children?: ReactNode;
  isAdmin?: boolean;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  isAdmin,
}) => {
  // const pageName = useLocation().pathname;
  const permission = usePermission();
  const { canAccessAdminArea: validRole } = useRole();

  if (permission === null) {
    return <Loading />;
  }
  if (!permission) {
    return <Navigate to="/login" />;
  }
  if (isAdmin && validRole && permission) {
    if (children) return children;
    // return <Outlet />;
  }
  if (!isAdmin && permission) {
    // if (children) return children;
    return <Outlet />;
  }

  return <Navigate to="/login" />;
};

export default ProtectedRoute;
