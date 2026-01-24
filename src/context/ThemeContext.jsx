import { createContext, useState, useMemo, useEffect } from "react";
import { createTheme } from "@mui/material/styles";

// Contexto de Tema (Claro/Oscuro)
export const ThemeContext = createContext();

/**
 * Wrapper del proveedor de Tema.
 * Gestiona el modo (light/dark) y actualiza los atributos del documento y el tema de Material UI.
 */
export const ThemeProviderWrapper = ({ children }) => {
  // Inicializar modo desde localStorage o usar 'light' por defecto
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode || "light";
  });

  // Aplicar el tema al root del documento HTML (para estilos CSS globales/Tailwind)
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-theme", mode);
    // Persistir preferencia
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  // Función para alternar entre claro y oscuro
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // Crear tema de Material UI memoizado
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
