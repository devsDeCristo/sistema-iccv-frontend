import { Route } from 'react-router-dom';
import { Events } from '..';
import { EventsDetails } from '../details';
import { Subscribe } from '../subscribe';

function RoutesEvents() {
  return (
    <>
      <Route path="/eventos" element={<Events />} />
      <Route path="/eventos/:id" element={<EventsDetails />} />
      <Route path="/eventos/:id/inscricao" element={<Subscribe />} />
    </>
  );
}

export { RoutesEvents };
