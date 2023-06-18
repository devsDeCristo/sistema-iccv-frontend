import { Routes, Route } from 'react-router-dom';
import { Users } from '..';
import { RegisterUser } from '../register';

function RoutesUsers() {
  return (
    <Routes>
      <Route path="/" element={<Users />} />
      <Route path="/cadastro" element={<RegisterUser />} />
    </Routes>
  );
}

export { RoutesUsers };
