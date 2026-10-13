import { Navigate, Route } from 'react-router-dom';
import { Home } from '../../../../features/admin/home';
import { useRole } from '../../../../hooks/useRole';

/**
 * O tesoureiro(a) e o admin de evento não trabalham em igreja nenhuma: a home
 * (números da igreja) não é deles, e a entrada do painel é a lista dos
 * eventos deles.
 */
function Inicio() {
  const { soPorEvento } = useRole();
  if (soPorEvento) return <Navigate to="/admin/eventos" replace />;
  return <Home />;
}

/**
 * Entrada do painel. Sem `RequireRole`: a tela é dos quatro perfis que chegam
 * até aqui, e o que cada um vê é a resposta da API — o `authLoaderAdmin` já
 * barrou quem não entra no painel.
 */
function RoutesHomeAdmin() {
  return <Route path="/admin/inicio" element={<Inicio />} />;
}

export { RoutesHomeAdmin };
