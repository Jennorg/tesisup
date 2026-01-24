import React, { createContext, useState, useContext, useEffect } from "react";

// Contexto de Autenticación
const AuthContext = createContext(null);

/**
 * Proveedor de Autenticación (AuthProvider)
 * Gestiona el estado global de autenticación (usuario y token).
 * Persiste la sesión utilizando localStorage.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    // Sincronizar estado al cargar o cuando cambia el token
    if (token && token !== "null" && token !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error al parsear usuario de localStorage", error);
          localStorage.removeItem("user");
        }
      }
    } else if (token === "null" || token === "undefined") {
      logout();
    }
  }, [token]);

  /**
   * Inicia sesión guardando token y datos de usuario.
   * @param {Object} userData - Información del usuario.
   * @param {string} authToken - Token JWT.
   */
  const login = (userData, authToken) => {
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  /**
   * Cierra sesión eliminando token y datos de localStorage.
   */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  /**
   * Verifica si existe una sesión activa válida.
   * @returns {boolean}
   */
  const isAuthenticated = () => {
    return !!token && token !== "null" && token !== "undefined";
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto de autenticación.
 */
export const useAuth = () => {
  return useContext(AuthContext);
};
