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

/**
 * Azul e violeta de destaque das faixas tingidas (boas-vindas, próximo evento).
 *
 * Existem porque no tema claro a primária é quase preta (`#1C0F4D`): esmaecida,
 * ela vira cinza em vez de cor, e a faixa fica apagada. O azul é o mesmo que a
 * primária tem no tema escuro, onde o fundo já funcionava.
 */
export const AZUL_VIVO = '#2563EB';
export const VIOLETA_VIVO = '#7C3AED';

/**
 * Degradê de tingimento de uma superfície.
 *
 * Vai em `backgroundImage`, nunca em `background`: o shorthand apagaria a cor de
 * fundo do Paper e a superfície desapareceria.
 *
 * `forca` reduz a intensidade proporcionalmente, para uma faixa menor tingir
 * menos que o cabeçalho da página sem virar outro tom.
 */
export const degradeVivo = (colorMode: boolean, angulo = 120, forca = 1) =>
  colorMode
    ? `linear-gradient(${angulo}deg, ${alpha(
        AZUL_VIVO,
        0.18 * forca
      )}, transparent 62%)`
    : `linear-gradient(${angulo}deg, ${alpha(
        AZUL_VIVO,
        0.18 * forca
      )}, ${alpha(VIOLETA_VIVO, 0.12 * forca)} 46%, transparent 80%)`;

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
    /** a terceira cor do módulo aberto (ver `CORES_DO_MODULO`); fora dele, o violeta */
    tertiary: { main: string };
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
    tertiary?: { main: string };
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

export type CoresDoTema = {
  primaria: string;
  secundaria: string;
  terciaria: string;
};

/**
 * O tema do sistema. Com `modulo`, o mesmo tema com as três cores do módulo
 * (`CORES_DO_MODULO`): só a cor muda — raio, sombra, fonte e espaçamento são
 * os de sempre. Os botões cheio e de contorno, que aqui têm cor fixa, passam
 * a usar a primária do módulo.
 */
export const myTheme = (
  colorMode: boolean,
  modulo?: { claro: CoresDoTema; escuro: CoresDoTema }
) => {
  const cores = modulo?.[colorMode ? 'escuro' : 'claro'];
  const botao = cores?.primaria ?? (colorMode ? '#EBEBEB' : '#1C0F4D');

  return createTheme({
    palette: {
      mode: colorMode ? 'dark' : 'light',
      primary: {
        main: cores?.primaria ?? (colorMode ? '#2563EB' : '#1C0F4D'),
      },
      secondary: {
        main: cores?.secundaria ?? (colorMode ? '#28363F' : '#111B21'),
      },
      tertiary: { main: cores?.terciaria ?? VIOLETA_VIVO },
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
      /**
       * Barra de rolagem do sistema inteiro, minimalista: fina, sem trilho e
       * com o polegar na cor do texto bem apagada (acende um pouco com o mouse
       * em cima, no Safari e no Chrome antigo).
       *
       * As duas formas: `scrollbar-width`/`scrollbar-color` (Firefox e Chrome
       * 121+, que com elas ignoram o `::-webkit-scrollbar`) e o
       * `::-webkit-scrollbar` (Safari). Tela que esconde a barra de propósito
       * (o carrossel) segue escondendo: a regra dela é mais específica.
       */
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(
              colorMode ? '#EBEBEB' : '#111B21',
              0.18
            )} transparent`,
          },
          '*::-webkit-scrollbar': { width: 8, height: 8 },
          '*::-webkit-scrollbar-track, *::-webkit-scrollbar-corner': {
            background: 'transparent',
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(colorMode ? '#EBEBEB' : '#111B21', 0.18),
            borderRadius: 8,
            // a borda transparente afina o polegar dentro dos 8px
            border: '2px solid transparent',
            backgroundClip: 'content-box',
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: alpha(colorMode ? '#EBEBEB' : '#111B21', 0.35),
          },
        },
      },
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
            backgroundColor: botao,
            '&:hover': {
              backgroundColor: alpha(botao, 0.8),
            },
            color: !colorMode ? '#EBEBEB' : '#111B21',
          },
          outlined: {
            borderColor: botao,
            color: botao,
            '&:hover': {
              borderColor: alpha(botao, 0.8),
              backgroundColor: alpha(botao, 0.04),
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
      /**
       * O que flutua sobre a página — menu de três pontos, opções do select —
       * é uma camada acima dos cards. Com o Paper padrão (#F8F8F8 e a sombra
       * leve de superfície) o menu se confundia com o fundo (#F0F1F4) no tema
       * claro; ganha branco, contorno fino e sombra funda. No escuro o tom do
       * Paper já destacava, e fica como estava.
       */
      MuiPopover: {
        styleOverrides: {
          paper: colorMode
            ? {}
            : {
                backgroundColor: '#FFFFFF',
                boxShadow:
                  '0 0 0 1px rgba(16,24,40,.08), 0 4px 8px -2px rgba(16,24,40,.08), 0 16px 32px -8px rgba(16,24,40,.24)',
              },
        },
      },
      /**
       * O ícone do item de menu reage ao passar o mouse: cresce, inclina de
       * leve e brilha na própria cor (`currentColor`, a cor que cada ação dá
       * ao ícone). Para quem pede menos movimento no sistema, só o brilho.
       */
      MuiMenuItem: {
        styleOverrides: {
          root: {
            '& .MuiListItemIcon-root svg': {
              transition: 'transform .2s ease, filter .2s ease',
            },
            '&:hover .MuiListItemIcon-root svg': {
              transform: 'scale(1.18) rotate(-8deg)',
              filter: 'drop-shadow(0 0 5px currentColor)',
            },
            '@media (prefers-reduced-motion: reduce)': {
              '&:hover .MuiListItemIcon-root svg': { transform: 'none' },
            },
          },
        },
      },
      /**
       * Todo campo com contorno do sistema (TextField, Select, Autocomplete,
       * datas) segue o campo de busca das listas: destaca do Paper por tom
       * (`background.input`), não por sombra, e o foco pinta a borda na cor
       * primária sem engrossá-la — engrossar empurra o texto um pixel e o
       * campo "pula" ao focar. Erro e desabilitado ficam com o padrão do MUI.
       */
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 8,
            backgroundColor: theme.palette.background.input,
            '&:hover:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled) .MuiOutlinedInput-notchedOutline':
              {
                borderColor: theme.palette.border,
              },
            '&.Mui-focused:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
              borderWidth: 1,
              borderColor: theme.palette.primary.main,
            },
          }),
          notchedOutline: ({ theme }) => ({
            borderColor: theme.palette.divider,
          }),
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
      MuiTypography: {
        styleOverrides: {
          root: {
            color: colorMode ? '#EBEBEB' : '#111B21',
          },
        },
      },
    },
  });
};
