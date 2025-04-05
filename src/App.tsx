import * as React from 'react';
import { RoutesUsers } from './pages/users/routes';
import { SideBar } from './components/sideBar';
import { RoutesEvents } from './pages/events/routes';
import { ToastContainer } from 'react-toastify';
import { RoutesLogin } from './pages/login/routes';
import { myTheme } from './themes';
import { ThemeProvider } from '@emotion/react';
import ProtectedRoute from './components/protectedRoute';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RegisterUser } from './pages/users/register';

function Loading() {
  return <p>Loading ...</p>;
}
function App() {
  const [permission, setPermission] = React.useState<boolean | null>(null);
  const [validRole, setValidRole] = React.useState<boolean | null>(null);
  return (
    <ThemeProvider theme={myTheme}>
      <div style={{ display: 'flex' }}>
        <React.Suspense fallback={<Loading />}>
          <Routes>
            {RoutesLogin()}
            <Route path="/user/register" element={<RegisterUser />} />
            <Route path="*" element={<Navigate replace to="/login" />} />
            <Route
              element={
                <ProtectedRoute
                  permission={permission}
                  setPermission={setPermission}
                  validRole={validRole}
                  setValidRole={setValidRole}
                >
                  <SideBar />
                </ProtectedRoute>
              }
            >
              {RoutesUsers()}
              {RoutesEvents()}
            </Route>
          </Routes>
        </React.Suspense>
        <ToastContainer autoClose={5000} closeOnClick />
      </div>
    </ThemeProvider>
  );
}

export default App;
