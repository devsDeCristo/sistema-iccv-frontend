import * as React from 'react';
import { RoutesUsers } from './pages/users/routes';
import { SideBar } from './components/sideBar';
import { RoutesEvents } from './pages/events/routes';
import { usePermission } from './hooks/usePermission';
import { ToastContainer } from 'react-toastify';

function Loading() {
  return <p>Loading ...</p>;
}
function App() {
  const permission = usePermission();
  return (
    <div style={{ display: 'flex' }}>
      {permission && <SideBar />}

      <React.Suspense fallback={<Loading />}>
        <RoutesUsers />
        <RoutesEvents />
      </React.Suspense>

      <ToastContainer autoClose={5000} closeOnClick />
    </div>
  );
}

export default App;
