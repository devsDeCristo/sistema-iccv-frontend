import { Navigate, Route } from 'react-router-dom';
import { Dispatchers } from '../dispatchers';
import { RequireRole } from '../../../components/requireRole';
import { Role } from '../../../constants/roles';

/**
 * Configurações do sistema. O número do WhatsApp é um só para todas as
 * igrejas: parear ou desconectar aqui derruba o disparo de todas elas, então a
 * tela é do super admin. Cada igreja escolhe os destinos da própria notícia na
 * tela de notícias.
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
          <RequireRole allowedRoles={[Role.SUPER_ADMIN]}>
            <Dispatchers />
          </RequireRole>
        }
      />
    </>
  );
}

export { RoutesSettings };
