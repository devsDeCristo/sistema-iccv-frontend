import { useParams } from 'react-router-dom';
import { QuadrantePage } from '../../../components/quadrante';

/**
 * Quadrante pela área do usuário. Só abre para inscrito, e só quando o evento
 * libera (`data.showQuadrante`) — o servidor confere as duas coisas.
 */
function EventQuadrante() {
  const { id: eventId = '' } = useParams();

  return <QuadrantePage eventId={eventId} pageBack={`/eventos/${eventId}`} />;
}

export { EventQuadrante };
