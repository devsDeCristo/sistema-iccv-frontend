import { Route } from 'react-router-dom';
import { OportunidadesAdmin } from '..';
import { EditarOportunidade } from '../editar';
import { RequireRole } from '../../../../components/requireRole';
import { ADMIN_ROLES } from '../../../../constants/roles';
import { TemaDoModulo } from '../../../../components/temaDoModulo';

const doAdmin = (tela: JSX.Element) => (
  <RequireRole allowedRoles={ADMIN_ROLES} modulo="OPPORTUNITIES">
    {tela}
  </RequireRole>
);

/** Publicar vaga é do admin da igreja; a tesouraria não entra */
function RoutesOportunidadesAdmin() {
  return (
    <Route element={<TemaDoModulo modulo="oportunidades" />}>
      <Route
        path="/admin/oportunidades"
        element={doAdmin(<OportunidadesAdmin />)}
      />
      <Route
        path="/admin/oportunidades/nova"
        element={doAdmin(<EditarOportunidade />)}
      />
      <Route
        path="/admin/oportunidades/:id"
        element={doAdmin(<EditarOportunidade />)}
      />
    </Route>
  );
}

export { RoutesOportunidadesAdmin };
