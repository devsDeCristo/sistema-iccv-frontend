import { Route } from 'react-router-dom';
import { Login } from '..';
import { ForgotPassword } from '../forgotPassword';

function RoutesLogin() {
  return (
    <>
      <Route path="/login" element={<Login />} />
      <Route path="/esqueci-senha" element={<ForgotPassword />} />
    </>
  );
}

export { RoutesLogin };
