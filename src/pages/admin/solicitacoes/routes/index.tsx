import { Route } from 'react-router-dom';
import { SolicitacoesAdmin } from '..';
import { RequireRole } from '../../../../components/requireRole';
import { ADMIN_ROLES } from '../../../../constants/roles';
import { TemaDoModulo } from '../../../../components/temaDoModulo';

/** Quem responde as solicitações é o admin da igreja */
function RoutesSolicitacoesAdmin() {
  return (
    <Route element={<TemaDoModulo modulo="solicitacoes" />}>
      <Route
        path="/admin/solicitacoes"
        element={
          <RequireRole allowedRoles={ADMIN_ROLES} modulo="REQUESTS">
            <SolicitacoesAdmin />
          </RequireRole>
        }
      />
    </Route>
  );
}

export { RoutesSolicitacoesAdmin };
