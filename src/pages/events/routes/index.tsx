import { Route } from 'react-router-dom';
import { Events } from '..';
import { Details } from '../details';

function RoutesEvents() {
  return (
    <>
      <Route path="/eventos" element={<Events />} />
      <Route path="/eventos/:id/detalhes/:subPage" element={<Details />} />
    </>
  );
}



export { RoutesEvents };
