import { Route } from 'react-router-dom';
import { Churches } from '../../../../features/admin/churches';
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
 */
function RoutesChurchesAdmin() {
  return (
    <Route
      path="/admin/igrejas"
      element={
        <RequireRole allowedRoles={SUPER_ADMIN_ROLES}>
          <Churches />
        </RequireRole>
      }
    />
  );
}

export { RoutesChurchesAdmin };
