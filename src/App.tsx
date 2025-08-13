import React from 'react';
import { ToastContainer } from 'react-toastify';
import { ThemeProvider } from '@emotion/react';
import { RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import routers from './routes';
import { CustomThemeProvider, useThemeContext } from './contexts/themeContext';

function Loading() {
  return <p>Loading ...</p>;
}

function AppContent() {
  const { theme } = useThemeContext();
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

function App() {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
}

export default App;
