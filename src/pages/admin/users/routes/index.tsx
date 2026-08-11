import { Route } from 'react-router-dom';
import { Users } from '..';
import { RegisterUser } from '../register';
import { EditUser } from '../edit';
import { RequireRole } from '../../../../components/requireRole';
import { ADMIN_ROLES } from '../../../../constants/roles';
// import { AssociateEvent } from '../associateEvent';

// gestão de usuários é exclusiva de super admin/admin — o financeiro não acessa
function RoutesUsersAdmin() {
  return (
    <>
      <Route
        path="/admin/usuarios"
        element={
          <RequireRole allowedRoles={ADMIN_ROLES}>
            <Users />
          </RequireRole>
        }
      />
      <Route
        path="/admin/usuario/:id/editar"
        element={
          <RequireRole allowedRoles={ADMIN_ROLES}>
            <EditUser />
          </RequireRole>
        }
      />
      <Route
        path="/admin/usuario/cadastrar"
        element={
          <RequireRole allowedRoles={ADMIN_ROLES}>
            <RegisterUser />
          </RequireRole>
        }
      />

      {/* <Route
        path="/cadastro-cursilho-work/participar"
        element={<AssociateUser />}
      /> */}
    </>
  );
}

export { RoutesUsersAdmin };
