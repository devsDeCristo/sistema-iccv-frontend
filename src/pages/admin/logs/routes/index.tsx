import { Route } from 'react-router-dom';
import { Logs } from '..';
import { RequireRole } from '../../../../components/requireRole';
import { SUPER_ADMIN_ROLES } from '../../../../constants/roles';

function RoutesLogsAdmin() {
  return (
    <>
      {/*
        Dev e super admin: a coluna de conteúdo mostra o antes e o depois de
        qualquer tabela, dado pessoal de inscrito incluído, de todas as
        igrejas — só quem já atravessa todas entra. A API confere o mesmo.
      */}
      <Route
        path="/admin/atividades"
        element={
          <RequireRole allowedRoles={SUPER_ADMIN_ROLES}>
            <Logs />
          </RequireRole>
        }
      />
    </>
  );
}

export { RoutesLogsAdmin };
