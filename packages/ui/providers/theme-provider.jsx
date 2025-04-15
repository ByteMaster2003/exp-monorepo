import { CssBaseline, useMediaQuery } from "@mui/material";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";
import { useState, useMemo, useEffect } from "react";

import { ThemeContext } from "../contexts/index.js";

export const ThemeProvider = ({ children }) => {
  // Detect system/browser theme
  const systemPrefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const [prefersDarkMode, setPrefersDarkMode] = useState(systemPrefersDark);
  const [mode, setMode] = useState(prefersDarkMode ? "dark" : "light");

  // Update prefersDarkMode when system preference changes
  useEffect(() => {
    setPrefersDarkMode(systemPrefersDark);
  }, [systemPrefersDark]);

  const toggleTheme = () => {
    setMode((prev) => {
      const newMode = prev === "light" ? "dark" : "light";
      setPrefersDarkMode(newMode === "dark");
      return newMode;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode
        }
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, prefersDarkMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
