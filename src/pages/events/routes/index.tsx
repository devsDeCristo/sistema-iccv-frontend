import { Routes, Route } from 'react-router-dom';
import { Events } from '..';
import { Register } from '../register';
import { Details } from '../details';

function RoutesEvents() {
  return (
    <Routes>
      <Route path="/eventos" element={<Events />} />
      <Route path="/eventos/cadastro" element={<Register />} />
      <Route path="/eventos/:id/detalhes" element={<Details />} />
    </Routes>
  );
}

export { RoutesEvents };
