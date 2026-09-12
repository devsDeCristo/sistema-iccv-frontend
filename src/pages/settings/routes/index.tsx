import { Navigate, Route } from 'react-router-dom';
import { Dispatchers } from '../dispatchers';
import { PaymentsSettings } from '../payments';
import { RequireRole } from '../../../components/requireRole';
import { ADMIN_ROLES } from '../../../constants/roles';

/**
 * Configurações do sistema.
 *
 * As duas são por igreja: a conta que recebe o dinheiro e o número que dispara
 * o aviso. Quem administra a igreja configura a dela, e o recorte de verdade
 * vem do `ChurchTenantGuard` na API — aqui é só usabilidade.
 *
 * `ADMIN_ROLES` e não `[Role.SUPER_ADMIN]`: o dev é super admin com outro
 * rótulo, e o valor dele é `-1`. Comparar com o super admin puro o deixava de
 * fora, e ele era jogado de volta para o painel ao tentar abrir Configurações.
 *
 * O financeiro fica de fora das duas: ele dá baixa em pagamento, mas não
 * decide para qual conta o dinheiro vai nem por qual número o aviso sai.
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
          <RequireRole allowedRoles={ADMIN_ROLES}>
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
