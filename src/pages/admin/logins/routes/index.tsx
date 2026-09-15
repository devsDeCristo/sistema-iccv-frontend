import { Route } from 'react-router-dom';
import { RequireRole } from '../../../../components/requireRole';
import { Role } from '../../../../constants/roles';
import { LoginAttempts } from '..';

function RoutesLoginAttemptsAdmin() {
  return (
    <Route
      path="/admin/logins"
      element={
        <RequireRole allowedRoles={[Role.DEV]}>
          <LoginAttempts />
        </RequireRole>
      }
    />
  );
}

export { RoutesLoginAttemptsAdmin };