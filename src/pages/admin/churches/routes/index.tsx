import { Route } from 'react-router-dom';
import { Churches } from '../../../../features/admin/churches';
import { ChurchHome } from '../../../../features/admin/churchHome';
import { Planos } from '../../../../features/admin/planos';
import { RequireRole } from '../../../../components/requireRole';
import { SUPER_ADMIN_ROLES } from '../../../../constants/roles';

/**
 * A igreja é o tenant: criar, renomear ou apagar uma delas mexe no recorte de
 * todos os painéis, então a tela é só de quem tem poder de super admin — o
 * backend recusa o restante em `/churches`.
 *
 * `SUPER_ADMIN_ROLES` e não `Role.SUPER_ADMIN`: o dev é super admin com outro
 * rótulo, e é o que o `@Roles` da API e o item da régua lateral já dizem. Só
 * esta linha ficou para trás, e o dev que clicasse em "Igrejas" no menu era
 * devolvido para o painel.
 *
 * `:churchId` é a home daquela igreja — a mesma página que o admin dela abre
 * ao entrar. Ela mora debaixo da lista porque é de lá que se chega nela: o
 * admin não passa por aqui, ele já cai na home da igreja dele em
 * `/admin/inicio`.
 */
function RoutesChurchesAdmin() {
  return (
    <>
      <Route path="/admin/igrejas">
        <Route
          index
          element={
            <RequireRole allowedRoles={SUPER_ADMIN_ROLES}>
              <Churches />
            </RequireRole>
          }
        />
        <Route
          path=":churchId"
          element={
            <RequireRole allowedRoles={SUPER_ADMIN_ROLES}>
              <ChurchHome />
            </RequireRole>
          }
        />
      </Route>
      {/* os planos (o que cada igreja pode usar): também só do super admin */}
      <Route
        path="/admin/planos"
        element={
          <RequireRole allowedRoles={SUPER_ADMIN_ROLES}>
            <Planos />
          </RequireRole>
        }
      />
    </>
  );
}

export { RoutesChurchesAdmin };
