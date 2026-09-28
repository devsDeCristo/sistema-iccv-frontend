import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  ShouldRevalidateFunction,
} from 'react-router-dom';
import { RoutesLogin } from '../pages/login/routes';
import { RegisterUser } from '../pages/users/register';
import { Terms } from '../pages/terms';
import { Profile } from '../pages/profile';

import { RoutesHomeAdmin } from '../pages/admin/home/routes';
import { RoutesUsersAdmin } from '../pages/admin/users/routes';
import { RoutesUsers } from '../pages/users/routes';
import { RoutesEventsAdmin } from '../pages/admin/events/routes';
import { RoutesNewsAdmin } from '../pages/admin/news/routes';
import { RoutesLogsAdmin } from '../pages/admin/logs/routes';
import { RoutesLoginAttemptsAdmin } from '../pages/admin/logins/routes';
import { RoutesChurchesAdmin } from '../pages/admin/churches/routes';
import { authLoader } from '../auth/functions/authLoader';
import { RoutesEvents } from '../pages/events/routes';
import { authLoaderAdmin } from '../auth/functions/authLoaderAdmin';
import { Layout } from '../pages/layout';
import { UserProvider } from '../contexts/userContext';
import { RoutesMyRegisters } from '../pages/myRegisters/routers';
import { RoutesSettings } from '../pages/settings/routes';

/**
 * A validação da sessão não trava a troca de página.
 *
 * Antes o loader rodava a cada mudança de caminho, e a navegação esperava o
 * `/auth/validate` ir e voltar antes de montar a tela nova — que então fazia os
 * próprios pedidos: duas viagens em série por clique, sem nada na tela dizendo
 * que estava carregando. O pedido nem aparece no log do servidor (é silenciado
 * no interceptor), então a demora parecia vir do nada.
 *
 * Agora o loader roda ao entrar na área e quando o `Layout` pede de novo, em
 * segundo plano, a cada troca de página (`revalidate`, mesma URL). Navegar para
 * outra URL não espera por ele. Sessão vencida continua caindo no 401 do
 * interceptor do axios.
 */
const soNaRevalidacao: ShouldRevalidateFunction = ({ currentUrl, nextUrl }) =>
  currentUrl.href === nextUrl.href;

const routers = (): ReturnType<typeof createBrowserRouter> => {
  return createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="*" element={<Navigate replace to="/login" />} />
        {RoutesLogin()}
        <Route path="/usuario/cadastrar" element={<RegisterUser />} />
        {/* pública: o link sai do login e do cadastro, antes de haver conta */}
        <Route path="/termos" element={<Terms />} />

        <Route
          loader={authLoaderAdmin}
          shouldRevalidate={soNaRevalidacao}
          element={
            <UserProvider>
              <Layout isAdmin={true} />
            </UserProvider>
          }
        >
          {RoutesHomeAdmin()}
          {RoutesUsersAdmin()}
          {RoutesChurchesAdmin()}
          {RoutesEventsAdmin()}
          {RoutesNewsAdmin()}
          {RoutesLogsAdmin()}
          {RoutesLoginAttemptsAdmin()}
        </Route>
        {/*
          Configurações do sistema: mesma proteção da área administrativa, mas
          com régua lateral própria — entra pelo avatar da barra do topo.
        */}
        <Route
          loader={authLoaderAdmin}
          shouldRevalidate={soNaRevalidacao}
          element={
            <UserProvider>
              <Layout isAdmin area="configuracoes" />
            </UserProvider>
          }
        >
          {RoutesSettings()}
        </Route>

        <Route
          loader={authLoader}
          shouldRevalidate={soNaRevalidacao}
          element={
            <UserProvider>
              <Layout isAdmin={false} />
            </UserProvider>
          }
        >
          {RoutesUsers()}
          {RoutesEvents()}
          {RoutesMyRegisters()}
          {/* perfil de quem está logado — admin e usuário entram pelo mesmo menu */}
          <Route path="/perfil" element={<Profile />} />
        </Route>
      </Route>
    )
  );
};

export default routers;
