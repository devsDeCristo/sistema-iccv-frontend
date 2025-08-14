import { Route } from 'react-router-dom';
import { Events } from '..';

function RoutesEvents() {
  return (
    <>
      <Route path="/eventos" element={<Events />} />
    </>
  );
}

export { RoutesEvents };
