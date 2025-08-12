import React, { useState, useEffect, useMemo } from 'react';
// import { RoutesUsers, RoutesUsersAdmin } from './pages/admin/users/routes';
// import { SideBar } from './components/sideBar';
// import { RoutesEventsAdmin } from './pages/admin/events/routes';
import { ToastContainer } from 'react-toastify';
import { myTheme } from './themes';
import { ThemeProvider } from '@emotion/react';
import { RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
// import { RoutesEvents } from './pages/events/routes';
import routers from './routes';
// import { useMediaQuery } from '@mui/material';

function Loading() {
  return <p>Loading ...</p>;
}
function App() {
  const prefersDarkMode = false; // useMediaQuery('(prefers-color-scheme: dark)');
  const [colorMode, setColorMode] = useState(prefersDarkMode);

  useEffect(() => {
    setColorMode(prefersDarkMode);
  }, [prefersDarkMode]);

  useEffect(() => {
    const colorModeStorage = localStorage.getItem('theme');
    if (colorModeStorage) {
      const parsedColorMode = JSON.parse(colorModeStorage);
      setColorMode(parsedColorMode.colorMode);
    }
  }, []);
  const theme = useMemo(() => myTheme(colorMode), [colorMode]);
  const router = routers();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <React.Suspense fallback={<Loading />}>
        <div className="App">
          <RouterProvider router={router} />
          <ToastContainer autoClose={5000} closeOnClick />
        </div>
      </React.Suspense>
    </ThemeProvider>
  );
}

export default App;
