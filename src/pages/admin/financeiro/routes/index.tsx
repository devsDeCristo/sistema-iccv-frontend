import { Navigate, Route } from 'react-router-dom';
import { RequireRole } from '../../../../components/requireRole';
import { ADMIN_AREA_ROLES } from '../../../../constants/roles';
import { Conciliacao } from '../conciliacao';
import { Dizimistas } from '../dizimistas';
import { Lancamentos } from '../lancamentos';

/** O financeiro é do admin e do financeiro da igreja: `ADMIN_AREA_ROLES` */
function RoutesFinanceiroAdmin() {
  return (
    <>
      {/* "Financeiro" no menu é um grupo: abre direto no livro-caixa */}
      <Route
        path="/admin/financeiro"
        element={<Navigate replace to="/admin/financeiro/lancamentos" />}
      />
      <Route
        path="/admin/financeiro/conciliacao"
        element={
          <RequireRole allowedRoles={ADMIN_AREA_ROLES}>
            <Conciliacao />
          </RequireRole>
        }
      />
      <Route
        path="/admin/financeiro/lancamentos"
        element={
          <RequireRole allowedRoles={ADMIN_AREA_ROLES}>
            <Lancamentos />
          </RequireRole>
        }
      />
      <Route
        path="/admin/financeiro/dizimistas"
        element={
          <RequireRole allowedRoles={ADMIN_AREA_ROLES}>
            <Dizimistas />
          </RequireRole>
        }
      />
    </>
  );
}

export { RoutesFinanceiroAdmin };
