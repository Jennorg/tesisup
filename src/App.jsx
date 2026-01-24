import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "@/components/Auth/Login";
import SignUp from "@/components/Auth/Signup";
import MainPage from "@/components/main/MainPage";
import Profile from "@/components/main/Profile/Profile";
import Auth from "@/utils/Auth";

/**
 * Componente principal App.
 * Define la estructura de rutas de la aplicación.
 */
const App = () => {
  return (
    <Routes>
      {/* Rutas públicas: Accesibles sin autenticación */}
      <Route path="/login" element={<Login />} />
      <Route path="/signUp" element={<SignUp />} />

      {/* Rutas protegidas: Requieren autenticación mediante el componente Auth */}
      <Route element={<Auth />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/mainPage" element={<MainPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userType/:ci" element={<Profile />} />
      </Route>

      {/* Ruta 404 para cualquier URL no encontrada */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default App;
