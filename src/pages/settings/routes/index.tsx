import { Navigate, Route } from 'react-router-dom';
import { Dispatchers } from '../dispatchers';
import { PaymentsSettings } from '../payments';
import { RequireRole } from '../../../components/requireRole';
import { ADMIN_ROLES, Role } from '../../../constants/roles';

/**
 * Configurações do sistema.
 *
 * As duas telas têm dono diferente, e é por isso que o perfil exigido não é o
 * mesmo. O número do WhatsApp é um só para todas as igrejas — parear ou
 * desconectar ali derruba o disparo de todas —, então é tela de super admin. A
 * cobrança é por igreja: quem administra a sua configura a dela, e o recorte
 * de verdade vem do `ChurchTenantGuard` na API.
 *
 * O financeiro fica de fora das duas: ele dá baixa em pagamento, mas não
 * decide para qual conta o dinheiro vai.
 */
function RoutesSettings() {
  return (
    <>
      <Route
        path="/configuracoes"
        element={<Navigate replace to="/configuracoes/pagamentos" />}
      />
      <Route
        path="/configuracoes/disparadores"
        element={
          <RequireRole allowedRoles={[Role.SUPER_ADMIN]}>
            <Dispatchers />
          </RequireRole>
        }
      />
      <Route
        path="/configuracoes/pagamentos"
        element={
          <RequireRole allowedRoles={ADMIN_ROLES}>
            <PaymentsSettings />
          </RequireRole>
        }
      />
    </>
  );
}

export { RoutesSettings };
