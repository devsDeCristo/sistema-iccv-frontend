import { Route } from 'react-router-dom';
import { Oportunidades } from '..';
import { TemaDoModulo } from '../../../components/temaDoModulo';

/** A tela do membro, na área do participante */
function RoutesOportunidades() {
  return (
    <Route element={<TemaDoModulo modulo="oportunidades" />}>
      <Route path="/oportunidades" element={<Oportunidades />} />
    </Route>
  );
}

export { RoutesOportunidades };
