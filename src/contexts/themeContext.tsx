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
