import { Route } from 'react-router-dom';
import { Users } from '..';
import { RegisterUser } from '../register';
import { EditUser } from '../edit';
import { AssociateEvent } from '../associateEvent';

function RoutesUsers() {
  return (
    <>
      <Route path="/cadastrar-cursilho" element={<AssociateEvent />} />
      <Route path="/user/register" element={<RegisterUser />} />
      {/* <Route
        path="/cadastro-cursilho-work/participar"
        element={<AssociateUser />}
      /> */}
    </>
  );
}
function RoutesUsersAdmin() {
  return (
    <>
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/user/:id/editar" element={<EditUser />} />
      {/* <Route
        path="/cadastro-cursilho-work/participar"
        element={<AssociateUser />}
      /> */}
    </>
  );
}

export { RoutesUsers, RoutesUsersAdmin };
