import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { useThemeContext } from '../../contexts/themeContext';
import { myTheme } from '../../themes';
import {
  ChaveDoModulo,
  CORES_DO_MODULO,
} from '../../constants/identidadeDosModulos';
import { ModuloAtual } from './moduloAtual';

/**
 * As rotas de um módulo com as cores dele (`CORES_DO_MODULO`). Envolve só o
 * conteúdo da página: a barra lateral e o topo seguem com as cores da
 * plataforma. Modais e menus abertos daqui herdam as cores do módulo.
 */
function TemaDoModulo({ modulo }: { modulo: ChaveDoModulo }) {
  const { colorMode } = useThemeContext();
  const theme = useMemo(
    () => myTheme(colorMode, CORES_DO_MODULO[modulo]),
    [colorMode, modulo]
  );

  return (
    <ThemeProvider theme={theme}>
      <ModuloAtual.Provider value={modulo}>
        <Outlet />
      </ModuloAtual.Provider>
    </ThemeProvider>
  );
}

export { TemaDoModulo };
