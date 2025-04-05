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
      background: {
        default: '#F9F9F9',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#000000',
        secondary: '#727272',
        disabled: '#B7B7B7',
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
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'capitalize',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },
    },
  });
