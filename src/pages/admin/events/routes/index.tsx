import { Route } from 'react-router-dom';
import { Events } from '..';
import { Register } from '../register';
import { Details } from '../details';
import { Edit } from '../edit';
import { RequireRole } from '../../../../components/requireRole';
import { ADMIN_ROLES } from '../../../../constants/roles';

function RoutesEventsAdmin() {
  return (
    <>
      <Route path="/admin/eventos" element={<Events />} />
      {/* criar e editar evento são exclusivos de super admin/admin */}
      <Route
        path="/admin/eventos/cadastro"
        element={
          <RequireRole allowedRoles={ADMIN_ROLES}>
            <Register />
          </RequireRole>
        }
      />
      <Route
        path="/admin/eventos/:id/editar"
        element={
          <RequireRole allowedRoles={ADMIN_ROLES}>
            <Edit />
          </RequireRole>
        }
      />
      <Route
        path="/admin/eventos/:id/detalhes/:subPage"
        element={<Details />}
      />
    </>
  );
}

export { RoutesEventsAdmin };
