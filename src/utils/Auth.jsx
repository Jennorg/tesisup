import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Componente de Protección de Rutas (Wrapper).
 * Verifica si el usuario está autenticado antes de renderizar el contenido protegido.
 * Si no está autenticado, redirige a la página de inicio de sesión.
 * Utiliza el componente Outlet de React Router para renderizar rutas hijas.
 */
const Auth = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

export default Auth;
