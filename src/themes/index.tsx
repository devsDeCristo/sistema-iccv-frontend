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
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
  });
