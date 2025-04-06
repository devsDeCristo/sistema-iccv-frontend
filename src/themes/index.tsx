import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    xm: true; // Adiciona o breakpoint personalizado
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

export const myTheme = (colorMode: boolean) =>
  createTheme({
    palette: {
      mode: colorMode ? 'dark' : 'light',
      primary: {
        main: colorMode ? '#1952BC' : '#1C0F4D',
      },
      secondary: {
        main: colorMode ? '#28363F' : '#111B21',
      },
      background: {
        default: colorMode ? '#111B21' : '#F0F1F4',
        paper: colorMode ? '#202C33' : '#F8F8F8',
      },
      text: {
        primary: colorMode ? '#EBEBEB' : '#111B21',
        secondary: colorMode ? '#9FAAB0' : '#495C67',
        disabled: colorMode ? '#495C67' : '#696A6A',
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        xm: 375,
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
