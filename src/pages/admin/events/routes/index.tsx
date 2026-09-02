import { Route } from 'react-router-dom';
import { Events } from '..';
import { Register } from '../register';
import { Details } from '../details';
import { Edit } from '../edit';
import {
  RequireEventRole,
  RequireRole,
} from '../../../../components/requireRole';
import { ADMIN_ROLES } from '../../../../constants/roles';
import { Checkin } from '../../checkin';

function RoutesEventsAdmin() {
  return (
    <>
      <Route path="/admin/eventos" element={<Events />} />
      {/* criar é de quem administra alguma igreja; editar depende da igreja
          do evento, então tem guarda própria */}
      <Route
        path="/admin/eventos/cadastro"
        element={
          <RequireRole allowedRoles={ADMIN_ROLES}>
            <Register />
          </RequireRole>
        }
      />
      <Route
        path="/admin/eventos/:id/editar"
        element={
          <RequireEventRole>
            <Edit />
          </RequireEventRole>
        }
      />
      <Route
        path="/admin/eventos/:id/detalhes/:subPage"
        element={<Details />}
      />
      {/* o check-in é de quem administra a igreja do evento: o financeiro não
          opera, e admin de outra igreja também não */}
      <Route
        path="/admin/eventos/:id/checkin"
        element={
          <RequireEventRole>
            <Checkin />
          </RequireEventRole>
        }
      />
    </>
  );
}

export { RoutesEventsAdmin };
