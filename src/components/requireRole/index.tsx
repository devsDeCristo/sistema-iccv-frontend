import { ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useRole } from '../../hooks/useRole';
import { useEventRole } from '../../hooks/useEventRole';
import { useGetEvents } from '../../features/admin/events/api/getEvents';
import { EventDetails } from '../../features/admin/events/types';

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

/**
 * Rota que exige administrar a igreja *deste* evento.
 *
 * `RequireRole` pergunta pelo perfil efetivo, que é o mais alto entre os
 * vínculos. Quem é admin numa igreja passa por ele em qualquer evento — e
 * chega numa tela de edição ou num check-in que a API recusa. Aqui a igreja do
 * evento entra na conta.
 */
function RequireEventRole({
  children,
  redirectTo = '/admin/eventos',
}: Omit<RequireRoleProps, 'allowedRoles'>) {
  const { id } = useParams();
  const { data, isError } = useGetEvents(
    { eventId: id, painel: true },
    { enabled: !!id }
  );
  const event = data as EventDetails;
  const { isAdminDoEvento, resolvido } = useEventRole(event?.churchId);

  // evento de outra igreja nem chega a existir para o painel: a resposta é 404
  if (isError) return <Navigate to={redirectTo} replace />;

  // sem a igreja não dá para decidir, e chutar aqui é redirecionar quem tem
  // permissão ou piscar a tela para quem não tem
  if (!resolvido) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdminDoEvento) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
}

export { RequireEventRole };
