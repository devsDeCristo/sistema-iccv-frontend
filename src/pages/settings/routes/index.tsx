import { Navigate, Route } from 'react-router-dom';
import { DispatcherWhatsapp } from '../dispatchers';
import { PaymentsSettings } from '../payments';
import { RequireRole } from '../../../components/requireRole';
import { ADMIN_ROLES } from '../../../constants/roles';

/**
 * Configurações do sistema.
 *
 * As duas são por igreja: a conta que recebe o dinheiro e o número que dispara
 * o aviso. Os disparadores são um grupo de canais — hoje só o WhatsApp —, cada
 * um com endereço próprio, e é a régua lateral que os lista. Quem administra a igreja configura a dela, e o recorte de verdade
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
      {/*
        "Disparadores" é grupo, não tela: quem clica nele na régua cai no
        primeiro canal. Redirecionar em vez de montar uma página de índice com
        um item só — e quando houver o segundo canal, é aqui que se decide qual
        abre primeiro.
      */}
      <Route
        path="/configuracoes/disparadores"
        element={
          <Navigate replace to="/configuracoes/disparadores/whatsapp" />
        }
      />
      <Route
        path="/configuracoes/disparadores/whatsapp"
        element={
          <RequireRole allowedRoles={ADMIN_ROLES}>
            <DispatcherWhatsapp />
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
