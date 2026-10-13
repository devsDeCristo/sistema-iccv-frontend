import { Route } from 'react-router-dom';
import { Users } from '..';
import { RegisterUser } from '../register';
import { EditUser } from '../edit';
import { RequireRole } from '../../../../components/requireRole';
import { ADMIN_ROLES, SUPER_ADMIN_ROLES } from '../../../../constants/roles';
// import { AssociateEvent } from '../associateEvent';

/**
 * A tela de Usuários (a lista de todos e o cadastro de alguém novo) é só de
 * dev e super admin. A igreja chega numa pessoa pelos inscritos do evento e
 * pela tela de Membros, que abrem o cadastro dela — por isso editar segue
 * aberto ao admin e ao admin de evento (a API confere que a pessoa é da igreja
 * dele, e o que cada um pode mudar).
 */
function RoutesUsersAdmin() {
  return (
    <>
      <Route
        path="/admin/usuarios"
        element={
          <RequireRole allowedRoles={SUPER_ADMIN_ROLES}>
            <Users />
          </RequireRole>
        }
      />
      <Route
        path="/admin/usuario/:id/editar"
        element={
          <RequireRole allowedRoles={ADMIN_ROLES} aceitaAdminDeEvento>
            <EditUser />
          </RequireRole>
        }
      />
      <Route
        path="/admin/usuario/cadastrar"
        element={
          <RequireRole allowedRoles={SUPER_ADMIN_ROLES}>
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
