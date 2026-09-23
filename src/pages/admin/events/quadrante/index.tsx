import { useParams } from 'react-router-dom';
import { QuadrantePage } from '../../../../components/quadrante';

/** Quadrante pelo painel: o admin abre sempre, com ou sem liberação. */
function Quadrante() {
  const { id: eventId = '' } = useParams();

  return (
    <QuadrantePage
      eventId={eventId}
      pageBack={`/admin/eventos/${eventId}/detalhes/equipes`}
    />
  );
}

export { Quadrante };
