import { Route } from 'react-router-dom';
import { Home } from '../../../../features/admin/home';

/**
 * Entrada do painel. Sem `RequireRole`: a tela é dos quatro perfis que chegam
 * até aqui, e o que cada um vê é a resposta da API — o `authLoaderAdmin` já
 * barrou quem não entra no painel.
 */
function RoutesHomeAdmin() {
  return <Route path="/admin/inicio" element={<Home />} />;
}

export { RoutesHomeAdmin };
