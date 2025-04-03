import { Route } from 'react-router-dom';
import { Login } from '..';

function RoutesLogin() {
  return (
    <>
      <Route path="/login" element={<Login />} />
    </>
  );
}

export { RoutesLogin };
