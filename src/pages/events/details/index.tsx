
import { useParams } from 'react-router-dom';
import { Header } from '../../../components/header';
import { PageStyle } from '../../../components/pageStyle';
import { useGetEvents } from '../../../features/admin/events/api/getEvents';
import { EventDetails } from '../../../features/admin/events/types';


function EventsDetails() {
    const { id = '' } = useParams();
      const { data: eventData } = useGetEvents(
        {
          eventId: id,
        },
        {
          enabled: !!id,
        }
      );
    const event = eventData as EventDetails;
    console.log(event);
  return (
    <PageStyle>
      <Header title={event?.name || "Detalhes do Evento"} />

   
    </PageStyle>
  );
}

export { EventsDetails };