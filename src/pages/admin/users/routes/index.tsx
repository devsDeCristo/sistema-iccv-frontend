import { Route } from 'react-router-dom';
import { Users } from '..';
import { RegisterUser } from '../register';
import { EditUser } from '../edit';
// import { AssociateEvent } from '../associateEvent';

function RoutesUsersAdmin() {
  return (
    <>
      <Route path="/admin/usuarios" element={<Users />} />
      <Route path="/admin/usuario/:id/editar" element={<EditUser />} />
      <Route path="/admin/usuario/cadastrar" element={<RegisterUser />} />

      {/* <Route
        path="/cadastro-cursilho-work/participar"
        element={<AssociateUser />}
      /> */}
    </>
  );
}

export { RoutesUsersAdmin };
