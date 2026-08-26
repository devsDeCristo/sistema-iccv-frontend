import React from 'react';
import { ToastContainer } from 'react-toastify';
import { RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
/**
 * ThemeProvider do MUI, não o do @emotion/react.
 *
 * O do emotion só popula o contexto de tema do emotion. O do MUI monta, além
 * dele, o DefaultPropsProvider — e é de lá que os componentes leem
 * `theme.components.*.defaultProps` desde o MUI 5.15.
 *
 * Com o do emotion, o `MuiPaper.defaultProps = { variant: 'outlined' }` do tema
 * era ignorado, todo Paper e Card voltava para `variant: 'elevation'` e, no
 * modo escuro, o Paper pinta um gradiente de branco por cima conforme a
 * elevação. Era isso que deixava a interface esbranquiçada.
 */
import { ThemeProvider } from '@mui/material/styles';
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
