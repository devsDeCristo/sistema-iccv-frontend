import { Navigate } from 'react-router-dom';
import { ReactNode, useEffect } from 'react';
import { usePermission } from '../../hooks/usePermission';
import { Loading } from '../loading';

type ProtectedRouteProps = {
  permission?: boolean | null;
  children: ReactNode;
  setPermission: (permission: boolean) => void;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permission,
  setPermission,
}) => {
  useEffect(() => {
    const permissionTeste = usePermission();
    if (permission !== permissionTeste) setPermission(permissionTeste);
  }, []);

  if (permission === null) {
    return <Loading />;
  }

  if (!permission) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
