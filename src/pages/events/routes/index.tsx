import { Route } from 'react-router-dom';
import { Events } from '..';
import { Register } from '../register';
import { Details } from '../details';

function RoutesEventsAdmin() {
  return (
    <>
      <Route path="/admin/eventos" element={<Events />} />
      <Route path="/admin/eventos/cadastro" element={<Register />} />
      <Route path="/admin/eventos/:id/detalhes/:subPage" element={<Details />} />
    </>
  );
}

function RoutesEvents() {
  return (
    <>
      <Route path="/eventos" element={<Events />} />
      <Route path="/eventos/:id/detalhes" element={<Details />} />
    </>
  );
}

export { RoutesEventsAdmin, RoutesEvents };
