import React, { createContext, useState, useMemo, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a context for color mode
const ColorModeContext = createContext({ toggleColorMode: () => {} });

// Custom hook to use the color mode
export const useColorMode = () => useContext(ColorModeContext);

export const ThemeProvider = ({ children }) => {
  // Try to get saved preference from localStorage, default to light
  const savedMode = localStorage.getItem('theme-mode') || 'light';
  const [mode, setMode] = useState(savedMode);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('theme-mode', newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#f50057',
          },
          background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
          },
        },
        components: {
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'light' ? '#ffffff' : '#1e1e1e',
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ThemeProvider;