import { Route } from 'react-router-dom';
import { Solicitacoes } from '..';
import { TemaDoModulo } from '../../../components/temaDoModulo';

/** A tela do membro, na área do participante */
function RoutesSolicitacoes() {
  return (
    <Route element={<TemaDoModulo modulo="solicitacoes" />}>
      <Route path="/solicitacoes" element={<Solicitacoes />} />
    </Route>
  );
}

export { RoutesSolicitacoes };
