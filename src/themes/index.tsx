import { createTheme } from '@mui/material/styles';

export const myTheme = () =>
  createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#28166F',
      },
      secondary: {
        main: '#727272',
      },
    },
  });
