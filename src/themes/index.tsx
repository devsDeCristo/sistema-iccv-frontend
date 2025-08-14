import { alpha, createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    xm: true; // Adiciona o breakpoint personalizado
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }

  interface TypeBackground {
    default: string;
    paper: string;
    hover: string;
    input: string;
    paperSecondary: string;
  }

  interface Palette {
    border: string;
    chips: {
      completed: string;
      pending: string;
      canceled: string;
      active: string;
    };
  }

  interface PaletteOptions {
    border?: string;
    chips?: {
      completed: string;
      pending: string;
      canceled: string;
      active: string;
    };
  }
}

export const myTheme = (colorMode: boolean) =>
  createTheme({
    palette: {
      mode: colorMode ? 'dark' : 'light',
      primary: {
        main: colorMode ? '#2563EB' : '#1C0F4D',
      },
      secondary: {
        main: colorMode ? '#28363F' : '#111B21',
      },
      divider: colorMode ? '#27303b' : '#DCDEE1',
      background: {
        default: colorMode ? '#030617' : '#F0F1F4',
        paper: colorMode ? '#0F172A' : '#F8F8F8',
        paperSecondary: colorMode ? '#1E293B' : '#FFFFFF',
        hover: colorMode ? '#1E293B' : '#EDEDED',
        input: colorMode ? '#324154' : '#FFFFFF',
      },
      text: {
        primary: colorMode ? '#EBEBEB' : '#111B21',
        secondary: colorMode ? '#9FAAB0' : '#495C67',
        disabled: colorMode ? '#495C67' : '#696A6A',
      },
      border: colorMode ? '#495C67' : '#D0D0D0',
      chips: {
        completed: colorMode ? '#1C0F4D' : '#362f4dff',
        pending: colorMode ? '#28363F' : '#F0F1F4',
        canceled: colorMode ? '#F44336' : '#FFCDD2',
        active: colorMode ? '#6aad6cff' : '#62df66ff',
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
          contained: {
            backgroundColor: colorMode ? '#EBEBEB' : '#1C0F4D',
            '&:hover': {
              backgroundColor: alpha(colorMode ? '#EBEBEB' : '#1C0F4D', 0.8),
            },
            color: !colorMode ? '#EBEBEB' : '#111B21',
          },
          outlined: {
            borderColor: colorMode ? '#EBEBEB' : '#1C0F4D',
            color: colorMode ? '#EBEBEB' : '#1C0F4D',
            '&:hover': {
              borderColor: alpha(colorMode ? '#EBEBEB' : '#1C0F4D', 0.8),
              backgroundColor: alpha(colorMode ? '#EBEBEB' : '#1C0F4D', 0.04),
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: {
          elevation: 0,
          variant: 'outlined',
        },
        styleOverrides: {
          root: {
            // borderRadius:8,
            elevation: 0,
            border: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            boxShadow: 'none',
            borderBottom: `1px solid ${colorMode ? '#27303b' : '#DCDEE1'}`,
          },
        },
      },
    },
  });
