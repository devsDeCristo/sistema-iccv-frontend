import { Routes, Route } from 'react-router-dom';
import { Login } from '..';

function RoutesLogin() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export { RoutesLogin };
