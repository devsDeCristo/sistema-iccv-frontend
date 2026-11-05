import { Route } from 'react-router-dom';
import { RequireRole } from '../../../../components/requireRole';
import { ADMIN_AREA_ROLES } from '../../../../constants/roles';
import { Membros } from '..';
import { TemaDoModulo } from '../../../../components/temaDoModulo';

/**
 * Admin da igreja (e dev/super admin) cuida dos membros; a tesouraria e o
 * tesoureiro(a) de evento entram só para consultar, e o admin de evento para
 * consultar e editar o perfil (a tela se ajusta)
 */
function RoutesMembrosAdmin() {
  return (
    <Route element={<TemaDoModulo modulo="membros" />}>
      <Route
        path="/admin/membros"
        element={
          <RequireRole
            allowedRoles={ADMIN_AREA_ROLES}
            aceitaTesoureiro="BASICO"
            aceitaAdminDeEvento
          >
            <Membros />
          </RequireRole>
        }
      />
    </Route>
  );
}

export { RoutesMembrosAdmin };
