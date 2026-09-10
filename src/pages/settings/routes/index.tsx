import { Navigate, Route } from 'react-router-dom';
import { Dispatchers } from '../dispatchers';
import { RequireRole } from '../../../components/requireRole';
import { SUPER_ADMIN_ROLES } from '../../../constants/roles';

/**
 * Configurações do sistema. O número do WhatsApp é um só para todas as
 * igrejas: parear ou desconectar aqui derruba o disparo de todas elas, então a
 * tela é de quem tem poder de super admin — o dev incluído, como no
 * `@Roles(...SUPER_ADMIN_ROLES)` do controller de WhatsApp. Cada igreja
 * escolhe os destinos da própria notícia na tela de notícias.
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
          <RequireRole allowedRoles={SUPER_ADMIN_ROLES}>
            <Dispatchers />
          </RequireRole>
        }
      />
    </>
  );
}

export { RoutesSettings };
