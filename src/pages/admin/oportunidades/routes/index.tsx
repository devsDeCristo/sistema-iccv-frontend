import { Route } from 'react-router-dom';
import { OportunidadesAdmin } from '..';
import { RequireRole } from '../../../../components/requireRole';
import { ADMIN_ROLES } from '../../../../constants/roles';
import { TemaDoModulo } from '../../../../components/temaDoModulo';

/** Publicar vaga é do admin da igreja; a tesouraria não entra */
function RoutesOportunidadesAdmin() {
  return (
    <Route element={<TemaDoModulo modulo="oportunidades" />}>
      <Route
        path="/admin/oportunidades"
        element={
          <RequireRole allowedRoles={ADMIN_ROLES} modulo="OPPORTUNITIES">
            <OportunidadesAdmin />
          </RequireRole>
        }
      />
    </Route>
  );
}

export { RoutesOportunidadesAdmin };
