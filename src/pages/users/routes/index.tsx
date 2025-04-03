import { Route } from 'react-router-dom';
import { Users } from '..';
import { RegisterUser } from '../register';
import { EditUser } from '../edit';

function RoutesUsers() {
  return (
    <>
      <Route path="/cadastro-cursilho-work" element={<RegisterUser />} />
      <Route path="/" element={<Users />} />
      <Route path="/user/:id/editar" element={<EditUser />} />
    </>
  );
}

export { RoutesUsers };
