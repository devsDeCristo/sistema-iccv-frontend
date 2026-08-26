import { Route } from 'react-router-dom';
import { NewsAdmin } from '..';
import { RequireRole } from '../../../../components/requireRole';
import { ADMIN_ROLES } from '../../../../constants/roles';

function RoutesNewsAdmin() {
  return (
    <>
      {/* o financeiro não publica notícia */}
      <Route
        path="/admin/noticias"
        element={
          <RequireRole allowedRoles={ADMIN_ROLES}>
            <NewsAdmin />
          </RequireRole>
        }
      />
    </>
  );
}

export { RoutesNewsAdmin };
