import { Route } from 'react-router-dom';
import { NewsAdmin } from '..';
import { RequireRole } from '../../../../components/requireRole';
import { ADMIN_ROLES } from '../../../../constants/roles';
import { TemaDoModulo } from '../../../../components/temaDoModulo';

function RoutesNewsAdmin() {
  return (
    <Route element={<TemaDoModulo modulo="noticias" />}>
      {/* a tesouraria não publica notícia */}
      <Route
        path="/admin/noticias"
        element={
          <RequireRole allowedRoles={ADMIN_ROLES} modulo="NEWS">
            <NewsAdmin />
          </RequireRole>
        }
      />
    </Route>
  );
}

export { RoutesNewsAdmin };
