import { Route } from 'react-router-dom';
import { Oportunidades } from '..';
import { Candidatura } from '../candidatura';
import { TemaDoModulo } from '../../../components/temaDoModulo';

/** As telas do membro, na área do participante */
function RoutesOportunidades() {
  return (
    <Route element={<TemaDoModulo modulo="oportunidades" />}>
      <Route path="/oportunidades" element={<Oportunidades />} />
      <Route path="/oportunidades/:id/candidatura" element={<Candidatura />} />
    </Route>
  );
}

export { RoutesOportunidades };
