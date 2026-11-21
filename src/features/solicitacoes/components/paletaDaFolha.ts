import { alpha, useTheme } from '@mui/material';

/** As cores da folha: o papel segue o tema; os títulos, a cor do módulo */
export function usePaleta() {
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';
  const texto = escuro ? '#EEF0F3' : '#16181D';
  return {
    escuro,
    papel: escuro ? '#1A1D24' : '#FBFAF6',
    texto,
    suave: alpha(texto, 0.6),
    linha: alpha(texto, 0.16),
    tinta: theme.palette.primary.main,
  };
}
export type Paleta = ReturnType<typeof usePaleta>;
