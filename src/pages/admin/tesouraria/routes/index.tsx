import { Navigate, Route } from 'react-router-dom';
import { RequireRole } from '../../../../components/requireRole';
import { ADMIN_AREA_ROLES } from '../../../../constants/roles';
import { useRole } from '../../../../hooks/useRole';
import { Conciliacao } from '../conciliacao';
import { Dizimistas } from '../dizimistas';
import { Lancamentos } from '../lancamentos';
import { TesourariaDeEventos } from '../eventos';
import { TesourariaDoEvento } from '../eventos/tesouraria';
import { TesourariaDeCongregacoes } from '../congregacoes';
import { TesourariaDaCongregacao } from '../congregacoes/tesouraria';
import { NaoAlocados } from '../naoAlocados';

/**
 * A tesouraria da igreja (o módulo de tesouraria): a administrativa, com
 * Conciliação, Dízimos e Lançamentos em abas, a de cada evento e a de cada
 * congregação. Admin e tesouraria da igreja: `ADMIN_AREA_ROLES`. A de
 * eventos aceita também o tesoureiro(a) completo de um evento, que vê só os
 * dele; congregações é só da igreja.
 */
/** O grupo abre na Administrativa; o tesoureiro(a) de evento, em Eventos */
function EntradaDaTesouraria() {
  const { soTesoureiroDeEvento } = useRole();
  return (
    <Navigate
      replace
      to={
        soTesoureiroDeEvento
          ? '/admin/tesouraria/eventos'
          : '/admin/tesouraria/administrativa'
      }
    />
  );
}

function RoutesTesourariaAdmin() {
  const comPerfil = (tela: JSX.Element) => (
    <RequireRole allowedRoles={ADMIN_AREA_ROLES} modulo="TREASURY">
      {tela}
    </RequireRole>
  );
  const comTesoureiroCompleto = (tela: JSX.Element) => (
    <RequireRole
      allowedRoles={ADMIN_AREA_ROLES}
      modulo="TREASURY"
      aceitaTesoureiro="COMPLETO"
    >
      {tela}
    </RequireRole>
  );

  return (
    <>
      {/* os grupos e as tesourarias abrem na primeira aba */}
      <Route path="/admin/tesouraria" element={<EntradaDaTesouraria />} />
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

      {/* tesourarias de evento — ver `features/admin/tesouraria/eventosECongregacoes` */}
      <Route
        path="/admin/tesouraria/eventos"
        element={comTesoureiroCompleto(<TesourariaDeEventos />)}
      />
      {/* o caminho fixo ganha do `:id` no roteador */}
      <Route
        path="/admin/tesouraria/eventos/nao-alocados"
        element={comPerfil(<NaoAlocados tipo="EVENT" />)}
      />
      <Route
        path="/admin/tesouraria/eventos/:id"
        element={<Navigate replace to="conciliacao" />}
      />
      <Route
        path="/admin/tesouraria/eventos/:id/:aba"
        element={comTesoureiroCompleto(<TesourariaDoEvento />)}
      />

      {/* tesourarias de congregação — ver docs/tesouraria-congregacoes.md */}
      <Route
        path="/admin/tesouraria/congregacoes"
        element={comPerfil(<TesourariaDeCongregacoes />)}
      />
      <Route
        path="/admin/tesouraria/congregacoes/nao-alocados"
        element={comPerfil(<NaoAlocados tipo="CONGREGATION" />)}
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

export { RoutesTesourariaAdmin };
