import { alpha, createTheme } from '@mui/material/styles';

/**
 * Sombra das superfícies (Paper, Card, tabela). Substitui a borda de 1px: é uma
 * sombra só, sem `border` em lugar nenhum.
 *
 * No claro, sombra escura difusa basta. No escuro ela não aparece — preto sobre
 * quase-preto não separa nada —, então a primeira camada é um aro branco de 1px
 * feito com `box-shadow`, que dá o recorte que a borda dava, e as outras duas
 * dão a profundidade.
 */
export const sombraSuperficie = (colorMode: boolean) =>
  colorMode
    ? '0 0 0 1px rgba(255,255,255,.07), 0 2px 4px rgba(0,0,0,.4), 0 12px 28px -8px rgba(0,0,0,.55)'
    : '0 1px 2px rgba(16,24,40,.05), 0 8px 20px -6px rgba(16,24,40,.12)';

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
      default: string;
      pending: string;
      canceled: string;
      success: string;
      info: string;
      alert: string;
    };
  }

  interface PaletteOptions {
    border?: string;
    chips?: {
      default: string;
      pending: string;
      canceled: string;
      success: string;
      info: string;
      alert: string;
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
        default: colorMode ? '#ffffffff' : '#1b263b',
        pending: colorMode ? '#a81ff7ff' : '#8217c0ff',
        canceled: colorMode ? '#ff1100ff' : '#fc182eff',
        success: colorMode ? '#51e956ff' : '#59945bff',
        info: colorMode ? '#2491ffff' : '#0080ffff',
        alert: colorMode ? '#f57c00' : '#ff8000ff',
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
            elevation: 0,
            border: 'none',
            borderRadius: 8,
            boxShadow: sombraSuperficie(colorMode),
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
      MuiTypography:{
        styleOverrides: {
          root: {
            color: colorMode ? '#EBEBEB' : '#111B21',
          },
        },
      },
    },
  });
