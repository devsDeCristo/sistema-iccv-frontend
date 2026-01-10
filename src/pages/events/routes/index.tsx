import { Route } from 'react-router-dom';
import { Events } from '..';
import { EventsDetails } from '../details';

function RoutesEvents() {
  return (
    <>
      <Route path="/eventos" element={<Events />} />
      <Route path="/eventos/:id" element={<EventsDetails />} />
    </>
  );
}

export { RoutesEvents };
