import { Route } from 'react-router-dom';
import { Logs } from '..';
import { RequireRole } from '../../../../components/requireRole';
import { Role } from '../../../../constants/roles';

function RoutesLogsAdmin() {
  return (
    <>
      {/*
        Só o perfil Dev: a coluna de conteúdo mostra o antes e o depois de
        qualquer tabela, dado pessoal de inscrito incluído. Nem super admin
        entra — a API responde 403 do mesmo jeito.
      */}
      <Route
        path="/admin/atividades"
        element={
          <RequireRole allowedRoles={[Role.DEV]}>
            <Logs />
          </RequireRole>
        }
      />
    </>
  );
}

export { RoutesLogsAdmin };
