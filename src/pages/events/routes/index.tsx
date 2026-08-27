import { Navigate, Route } from 'react-router-dom';
import { Events } from '..';
import { EventsDetails } from '../details';
import { Subscribe } from '../subscribe';

function RoutesEvents() {
  return (
    <>
      {/* a tela de entrada de quem não é da organização: além dos eventos
          abertos, ela traz a faixa de boas-vindas e o mural de notícias, por
          isso mora em /home e não em /eventos */}
      <Route path="/home" element={<Events />} />

      {/* o endereço antigo continua respondendo: era para onde o login levava,
          então tem gente com ele salvo no navegador */}
      <Route path="/eventos" element={<Navigate replace to="/home" />} />

      {/* o evento em si continua sob /eventos: a página é de um evento, não da
          home */}
      <Route path="/eventos/:id" element={<EventsDetails />} />
      <Route path="/eventos/:id/inscricao" element={<Subscribe />} />
    </>
  );
}

export { RoutesEvents };
