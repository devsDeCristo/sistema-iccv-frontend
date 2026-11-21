import { Route } from 'react-router-dom';
import { Oportunidades } from '..';
import { Candidatura } from '../candidatura';
import { Proposta } from '../proposta';
import { CandidaturasDaProposta } from '../candidaturasDaProposta';
import { TemaDoModulo } from '../../../components/temaDoModulo';

/** As telas do membro, na área do participante */
function RoutesOportunidades() {
  return (
    <Route element={<TemaDoModulo modulo="oportunidades" />}>
      <Route path="/oportunidades" element={<Oportunidades />} />
      <Route path="/oportunidades/:id/candidatura" element={<Candidatura />} />
      {/* propor e editar a proposta pendente (a vaga só vai ao ar aprovada) */}
      <Route path="/oportunidades/propor" element={<Proposta />} />
      <Route path="/oportunidades/propostas/:id" element={<Proposta />} />
      <Route
        path="/oportunidades/propostas/:id/candidaturas"
        element={<CandidaturasDaProposta />}
      />
    </Route>
  );
}

export { RoutesOportunidades };
