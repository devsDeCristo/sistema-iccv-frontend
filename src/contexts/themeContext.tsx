import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useMediaQuery } from '@mui/material';
import { myTheme } from '../themes';

interface ThemeContextType {
  colorMode: boolean;
  setColorMode: (mode: boolean) => void;
  toggleColorMode: () => void;
  theme: ReturnType<typeof myTheme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: light)');
  const [colorMode, setColorMode] = useState(false);

  useEffect(() => {
    setColorMode(prefersDarkMode);
  }, [prefersDarkMode]);

  useEffect(() => {
    const colorModeStorage = localStorage.getItem('theme');
    if (colorModeStorage) {
      setColorMode(colorModeStorage === 'dark');
    }
  }, []);

  /**
   * `color-scheme` do elemento raiz seguindo o tema do app.
   *
   * Quem pinta a barra de rolagem, e os controles nativos, é o navegador — e
   * ele obedece ao `color-scheme`, que no `index.css` está como `light dark`,
   * ou seja, segue o sistema operacional. Como o tema aqui é um interruptor
   * nosso, quem estivesse com o SO no escuro via barra escura mesmo no tema
   * claro.
   *
   * Vai em estilo inline no elemento: assim vence a regra do `:root` sem
   * depender da ordem em que as folhas de estilo entram na página.
   */
  useEffect(() => {
    document.documentElement.style.colorScheme = colorMode ? 'dark' : 'light';
  }, [colorMode]);

  const toggleColorMode = () => {
    const newMode = !colorMode;
    setColorMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const theme = useMemo(() => myTheme(colorMode), [colorMode]);

  const value = {
    colorMode,
    setColorMode,
    toggleColorMode,
    theme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a CustomThemeProvider');
  }
  return context;
};
