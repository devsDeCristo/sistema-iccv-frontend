import { Navigate, Route } from 'react-router-dom';
import { DispatcherWhatsapp } from '../dispatchers';
import { PaymentsSettings } from '../payments';
import { RequireRole } from '../../../components/requireRole';
import { ADMIN_ROLES, SUPER_ADMIN_ROLES } from '../../../constants/roles';
import { TermsSettings } from '../terms';

/**
 * Configurações do sistema.
 *
 * As duas são por igreja: a conta que recebe o dinheiro e o número que dispara
 * o aviso. Os disparadores são um grupo de canais — hoje só o WhatsApp —, cada
 * um com endereço próprio, e é a régua lateral que os lista. Quem administra a
 * igreja configura a dela, e o recorte de verdade vem do `ChurchTenantGuard`
 * na API — aqui é só usabilidade.
 *
 * `ADMIN_ROLES` e não `SUPER_ADMIN_ROLES`, e o motivo vale escrito porque a
 * `main` ainda carrega o antigo: o número do WhatsApp já foi **um só** para o
 * sistema inteiro, e enquanto foi assim parear ou desconectar aqui derrubava o
 * aviso de todas as igrejas — por isso a tela nasceu de super admin. Hoje o
 * número é da igreja (`churches/:churchId/whatsapp`, com `@Roles(...ADMIN_ROLES)`
 * e `ChurchTenantGuard` do outro lado), então quem administra uma mexe na dela
 * e não alcança ninguém. Voltar para `SUPER_ADMIN_ROLES` fecharia a tela para
 * exatamente quem ela passou a ser.
 *
 * O dev continua entrando: `ADMIN_ROLES` o inclui. Ele é super admin com outro
 * rótulo e valor `-1`, e comparar com o super admin puro o deixava de fora —
 * era jogado de volta para o painel ao tentar abrir Configurações.
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
      {/* os termos valem para a plataforma inteira: só super admin e dev */}
      <Route
        path="/configuracoes/termos"
        element={
          <RequireRole allowedRoles={SUPER_ADMIN_ROLES}>
            <TermsSettings />
          </RequireRole>
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
