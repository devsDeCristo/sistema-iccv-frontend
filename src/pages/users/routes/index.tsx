import { Routes, Route } from 'react-router-dom';
import { Users } from '..';
import { RegisterUser } from '../register';
import { EditUser } from '../edit';

function RoutesUsers() {
  return (
    <Routes>
      <Route path="/" element={<Users />} />
      <Route path="/cadastro" element={<RegisterUser />} />
      <Route path="/user/:id/editar" element={<EditUser />} />
    </Routes>
  );
}

export { RoutesUsers };
