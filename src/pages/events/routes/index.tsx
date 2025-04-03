import { Route } from 'react-router-dom';
import { Events } from '..';
import { Register } from '../register';
import { Details } from '../details';
import { AssociateUser } from '../associateUserEvent';

function RoutesEvents() {
  return (
    <>
      <Route path="/eventos" element={<Events />} />
      <Route path="/eventos/cadastro" element={<Register />} />
      <Route path="/eventos/:id/detalhes" element={<Details />} />
      <Route path="/eventos/participar" element={<AssociateUser />} />
    </>
  );
}

export { RoutesEvents };
