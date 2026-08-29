import { Navigate, Route } from 'react-router-dom';
import { Dispatchers } from '../dispatchers';
import { RequireRole } from '../../../components/requireRole';
import { ADMIN_ROLES } from '../../../constants/roles';

/**
 * Configurações do sistema. Mexe em canal de disparo da igreja inteira, então
 * fica fora do alcance do financeiro — só admin e super admin.
 */
function RoutesSettings() {
  return (
    <>
      <Route
        path="/configuracoes"
        element={<Navigate replace to="/configuracoes/disparadores" />}
      />
      <Route
        path="/configuracoes/disparadores"
        element={
          <RequireRole allowedRoles={ADMIN_ROLES}>
            <Dispatchers />
          </RequireRole>
        }
      />
    </>
  );
}

export { RoutesSettings };
