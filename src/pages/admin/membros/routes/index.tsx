import { Route } from 'react-router-dom';
import { RequireRole } from '../../../../components/requireRole';
import { ADMIN_ROLES } from '../../../../constants/roles';
import { Membros } from '..';

/** Só o admin da igreja (e dev/super admin): `ADMIN_ROLES` */
function RoutesMembrosAdmin() {
  return (
    <Route
      path="/admin/membros"
      element={
        <RequireRole allowedRoles={ADMIN_ROLES}>
          <Membros />
        </RequireRole>
      }
    />
  );
}

export { RoutesMembrosAdmin };
