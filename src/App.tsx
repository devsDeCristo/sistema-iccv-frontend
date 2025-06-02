import React, { useState, useEffect, useMemo } from 'react';
import { RoutesUsers, RoutesUsersAdmin } from './pages/users/routes';
import { SideBar } from './components/sideBar';
import { RoutesEvents } from './pages/events/routes';
import { ToastContainer } from 'react-toastify';
import { RoutesLogin } from './pages/login/routes';
import { myTheme } from './themes';
import { ThemeProvider } from '@emotion/react';
import ProtectedRoute from './components/protectedRoute';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RegisterUser } from './pages/users/register';
import { CssBaseline } from '@mui/material';
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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <React.Suspense fallback={<Loading />}>
          <Routes>
            {RoutesLogin()}
            <Route path="/user/register" element={<RegisterUser />} />
            <Route path="*" element={<Navigate replace to="/login" />} />
            <Route
              element={
                <ProtectedRoute isAdmin={true}>
                  <SideBar />
                </ProtectedRoute>
              }
            >
              {RoutesUsersAdmin()}
              {RoutesEvents()}
            </Route>
            <Route element={<ProtectedRoute isAdmin={false} />}>
              {RoutesUsers()}
            </Route>
          </Routes>
        </React.Suspense>
        <ToastContainer autoClose={5000} closeOnClick />
      </div>
    </ThemeProvider>
  );
}

export default App;
