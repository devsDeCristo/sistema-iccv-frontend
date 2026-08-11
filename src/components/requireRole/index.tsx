import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '../../hooks/useRole';

type RequireRoleProps = {
  /** Perfis com acesso à rota */
  allowedRoles: number[];
  children: ReactNode;
  /** Para onde mandar quem não tem permissão */
  redirectTo?: string;
};

/**
 * Esconde uma rota de quem não tem o perfil necessário.
 * É apenas usabilidade — quem garante a restrição é o RolesGuard da API.
 */
function RequireRole({
  allowedRoles,
  children,
  redirectTo = '/admin/eventos',
}: RequireRoleProps) {
  const { role } = useRole();

  if (role === null || !allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

export { RequireRole };
