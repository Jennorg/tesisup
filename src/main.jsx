import { StrictMode, useContext } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProviderWrapper, ThemeContext } from "./context/ThemeContext.jsx";

const AppWithTheme = () => {
  const { mode } = useContext(ThemeContext);

  const theme = createTheme({
    palette: {
      mode,
    },
  });

  return (
    <MuiThemeProvider theme={theme}>
      <App />
    </MuiThemeProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProviderWrapper>
      <BrowserRouter>
        <AuthProvider>
          <AppWithTheme />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProviderWrapper>
  </StrictMode>
);