import { StrictMode, useContext } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProviderWrapper, ThemeContext } from "./context/ThemeContext.jsx";

/**
 * Componente auxiliar para conectar el contexto de tema con el ThemeProvider de MUI.
 * Esto permite que los cambios de tema (dark/light) se propaguen a los componentes de Material UI.
 */
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
};

// Punto de entrada principal de la aplicación
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Proveedor de tema personalizado */}
    <ThemeProviderWrapper>
      {/* Proveedor de enrutamiento */}
      <BrowserRouter>
        {/* Proveedor de contexto de autenticación */}
        <AuthProvider>
          <AppWithTheme />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProviderWrapper>
  </StrictMode>,
);
