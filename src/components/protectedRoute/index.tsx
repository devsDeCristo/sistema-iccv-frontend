import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { Loading } from '../loading';
import { useRole } from '../../hooks/useRole';

type ProtectedRouteProps = {
  permission?: boolean | null;
  setPermission: (permission: boolean) => void;
  validRole?: boolean | null;
  setValidRole: (permission: boolean) => void;
  children: ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permission,
  setPermission,
  validRole,
  setValidRole,
}) => {
  const pageName = useLocation().pathname;
  useEffect(() => {
    const permissionTeste = usePermission();
    const validRoleTeste = useRole();

    if (permission !== permissionTeste) setPermission(permissionTeste);
    if (validRole !== validRoleTeste) setValidRole(validRoleTeste);
  }, []);

  if (permission === null) {
    return <Loading />;
  }
  if (!permission) {
    return <Navigate to="/login" />;
  }

  if (validRole === false && permission && pageName !== '/cadastrar-cursilho') {
    return <Navigate to="/cadastrar-cursilho" />;
  }
  //return <Navigate to="/cadastrar-cursilho" />;
  return children;
};

export default ProtectedRoute;
