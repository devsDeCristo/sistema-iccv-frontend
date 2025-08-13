import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
} from 'react-router-dom';
import { RoutesLogin } from '../pages/login/routes';
import { RegisterUser } from '../pages/users/register';

import { RoutesUsersAdmin } from '../pages/admin/users/routes';
import { RoutesUsers } from '../pages/users/routes';
import { RoutesEventsAdmin } from '../pages/admin/events/routes';
import { authLoader } from '../auth/functions/authLoader';
import { RoutesEvents } from '../pages/events/routes';
import { authLoaderAdmin } from '../auth/functions/authLoaderAdmin';
import { Layout } from '../pages/layout';
import { UserProvider } from '../contexts/userContext';

const routers = (): ReturnType<typeof createBrowserRouter> => {
  return createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="*" element={<Navigate replace to="/login" />} />
        {RoutesLogin()}
        <Route path="/usuario/cadastrar" element={<RegisterUser />} />

        <Route
          loader={authLoaderAdmin}
          shouldRevalidate={({ currentUrl, nextUrl }) => {
            return currentUrl.pathname !== nextUrl.pathname;
          }}
          element={
            <UserProvider>
              <Layout isAdmin={true} />
            </UserProvider>
          }
        >
          {RoutesUsersAdmin()}
          {RoutesEventsAdmin()}
        </Route>
        <Route
          loader={authLoader}
          shouldRevalidate={({ currentUrl, nextUrl }) => {
            return currentUrl.pathname !== nextUrl.pathname;
          }}
          element={
            <UserProvider>
              <Layout isAdmin={false} />
            </UserProvider>
          }
        >
          {RoutesUsers()}
          {RoutesEvents()}
        </Route>
      </Route>
    )
  );
};

export default routers;
