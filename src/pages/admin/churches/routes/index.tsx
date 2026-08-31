import { Route } from 'react-router-dom';
import { Churches } from '../../../../features/admin/churches';
import { RequireRole } from '../../../../components/requireRole';
import { Role } from '../../../../constants/roles';

/**
 * A igreja é o tenant: criar, renomear ou apagar uma delas mexe no recorte de
 * todos os painéis, então a tela é só do super admin — o backend recusa o
 * restante em `/churches`.
 */
function RoutesChurchesAdmin() {
  return (
    <Route
      path="/admin/igrejas"
      element={
        <RequireRole allowedRoles={[Role.SUPER_ADMIN]}>
          <Churches />
        </RequireRole>
      }
    />
  );
}

export { RoutesChurchesAdmin };
