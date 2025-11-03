
import { createContext, useState, useMemo, useEffect } from 'react';
import { createTheme } from '@mui/material/styles';

export const ThemeContext = createContext();

export const ThemeProviderWrapper = ({ children }) => {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode],
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
