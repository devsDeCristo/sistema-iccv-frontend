import { Navigate, Route } from 'react-router-dom';
import { RequireRole } from '../../../../components/requireRole';
import { ADMIN_AREA_ROLES } from '../../../../constants/roles';
import { Conciliacao } from '../conciliacao';
import { Dizimistas } from '../dizimistas';
import { Lancamentos } from '../lancamentos';
import { TesourariaDeEventos } from '../eventos';
import { TesourariaDoEvento } from '../eventos/tesouraria';
import { TesourariaDeCongregacoes } from '../congregacoes';
import { TesourariaDaCongregacao } from '../congregacoes/tesouraria';

/**
 * A tesouraria da igreja (o módulo financeiro): a administrativa, com
 * Conciliação, Dízimos e Lançamentos em abas, a de cada evento e a de cada
 * congregação. Admin e financeiro da igreja: `ADMIN_AREA_ROLES`.
 */
function RoutesFinanceiroAdmin() {
  const comPerfil = (tela: JSX.Element) => (
    <RequireRole allowedRoles={ADMIN_AREA_ROLES} modulo="TREASURY">
      {tela}
    </RequireRole>
  );

  return (
    <>
      {/* os grupos e as tesourarias abrem na primeira aba */}
      <Route
        path="/admin/tesouraria"
        element={<Navigate replace to="/admin/tesouraria/administrativa" />}
      />
      <Route
        path="/admin/tesouraria/administrativa"
        element={
          <Navigate replace to="/admin/tesouraria/administrativa/conciliacao" />
        }
      />
      <Route
        path="/admin/tesouraria/administrativa/conciliacao"
        element={comPerfil(<Conciliacao />)}
      />
      <Route
        path="/admin/tesouraria/administrativa/dizimos"
        element={comPerfil(<Dizimistas />)}
      />
      <Route
        path="/admin/tesouraria/administrativa/lancamentos"
        element={comPerfil(<Lancamentos />)}
      />

      {/* MVP com dados de exemplo — ver `features/admin/financeiro/tesouraria` */}
      <Route
        path="/admin/tesouraria/eventos"
        element={comPerfil(<TesourariaDeEventos />)}
      />
      <Route
        path="/admin/tesouraria/eventos/:id"
        element={<Navigate replace to="conciliacao" />}
      />
      <Route
        path="/admin/tesouraria/eventos/:id/:aba"
        element={comPerfil(<TesourariaDoEvento />)}
      />

      {/* MVP com dados de exemplo — ver docs/tesouraria-congregacoes.md */}
      <Route
        path="/admin/tesouraria/congregacoes"
        element={comPerfil(<TesourariaDeCongregacoes />)}
      />
      <Route
        path="/admin/tesouraria/congregacoes/:id"
        element={<Navigate replace to="conciliacao" />}
      />
      <Route
        path="/admin/tesouraria/congregacoes/:id/:aba"
        element={comPerfil(<TesourariaDaCongregacao />)}
      />
    </>
  );
}

export { RoutesFinanceiroAdmin };
