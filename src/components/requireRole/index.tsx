import { ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useRole } from '../../hooks/useRole';
import { useEventRole } from '../../hooks/useEventRole';
import { useGetEvents } from '../../features/admin/events/api/getEvents';
import { EventDetails } from '../../features/admin/events/types';
import { useModulos } from '../../hooks/useModulos';
import { ModuloDaIgreja } from '../../constants/modulos';
import { ForaDoPlano } from '../foraDoPlano';

const Carregando = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
    <CircularProgress />
  </Box>
);

type RequireRoleProps = {
  /** Perfis com acesso à rota */
  allowedRoles: number[];
  children: ReactNode;
  /** Para onde mandar quem não tem permissão */
  redirectTo?: string;
  /**
   * O módulo do plano que a tela é: sem nenhuma igreja da pessoa com ele no
   * plano, a tela diz que está fora do plano
   */
  modulo?: ModuloDaIgreja;
};

/**
 * Esconde uma rota de quem não tem o perfil necessário.
 * É apenas usabilidade — quem garante a restrição é o RolesGuard da API.
 */
function RequireRole({
  allowedRoles,
  children,
  redirectTo = '/admin/inicio',
  modulo,
}: RequireRoleProps) {
  const { role } = useRole();
  const { temModulo } = useModulos();

  if (role === null || !allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  if (modulo && !temModulo(modulo)) return <ForaDoPlano modulo={modulo} />;

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
  redirectTo = '/admin/inicio',
}: Omit<RequireRoleProps, 'allowedRoles'>) {
  const { id } = useParams();
  const { data, isError } = useGetEvents(
    { eventId: id, painel: true },
    { enabled: !!id }
  );
  const event = data as EventDetails;
  const { isAdminDoEvento, resolvido } = useEventRole(event?.churchId);
  const modulos = useModulos();

  // evento de outra igreja nem chega a existir para o painel: a resposta é 404
  if (isError) return <Navigate to={redirectTo} replace />;

  // sem a igreja não dá para decidir, e chutar aqui é redirecionar quem tem
  // permissão ou piscar a tela para quem não tem
  if (!resolvido) return <Carregando />;

  if (!isAdminDoEvento) return <Navigate to={redirectTo} replace />;

  // a igreja deste evento precisa ter Eventos no plano (a API recusa sem)
  if (!modulos.igrejaTem(event.churchId, 'EVENTS')) {
    return <ForaDoPlano modulo="EVENTS" />;
  }

  return <>{children}</>;
}

export { RequireEventRole };
