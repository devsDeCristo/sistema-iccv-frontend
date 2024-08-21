import * as React from 'react';
import { RoutesUsers } from './pages/users/routes';
import { SideBar } from './components/sideBar';
import { RoutesEvents } from './pages/events/routes';
import { usePermission } from './hooks/usePermission';
import { ToastContainer } from 'react-toastify';
import { Navigate, useNavigate } from 'react-router-dom';
import { RoutesLogin } from './pages/login/routes';
import { myTheme } from './themes';
import { ThemeProvider } from '@emotion/react';

function Loading() {
  return <p>Loading ...</p>;
}
function App() {
  const permission = usePermission();
  const navigate = useNavigate();
  React.useEffect(() => {
    setTimeout(() => {
      loginValidate();
    }, 200);

    async function loginValidate() {
      //const data = await checkToken();
      const permission = usePermission();

      if (!permission) {
        navigate('/login');
      } else {
        navigate('/eventos');
      }
    }
  }, []);
  return (
    <ThemeProvider theme={myTheme}>
      <div style={{ display: 'flex' }}>
        {/* {permission ? <SideBar /> : <Navigate to="/login" />} */}
        <RoutesLogin />
        <React.Suspense fallback={<Loading />}>
          {permission ? (
            <>
              <SideBar />
              <RoutesUsers />
              <RoutesEvents />
            </>
          ) : (
            <Navigate to="/login" />
          )}
        </React.Suspense>

        <ToastContainer autoClose={5000} closeOnClick />
      </div>
    </ThemeProvider>
  );
}

export default App;
