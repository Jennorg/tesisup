import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "@/components/Home";
import Login from "@/components/Auth/Login";
import SignUp from "@/components/Auth/Signup";
import MainPage from "@/components/main/MainPage";
import Perfil from "@/components/Perfil/Perfil";
import BusquedaAvanzada from "@/components/detailSearch/DetailSearch";
import FormularioRegistroEstudiante from "@/components/estudiantes/FormularioRegistroEstudiante";
import FormularioBusquedaEstudiante from "@/components/estudiantes/FormularioBusquedaEstudiante";
import Auth from "@/utils/Auth";

const App = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas */}
      <Route element={<Auth />}>
        {/* unicamente un usuario previamente registrado puede registrar a otro usuario */}
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/mainPage" element={<MainPage />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/busqueda-avanzada" element={<BusquedaAvanzada />} />
        <Route
          path="/registrar-estudiante"
          element={<FormularioRegistroEstudiante />}
        />
        <Route
          path="/buscar-estudiantes"
          element={<FormularioBusquedaEstudiante />}
        />
        {/* Rutas de compatibilidad para mantener enlaces existentes */}
        <Route
          path="/perfil_estudiantes"
          element={<FormularioRegistroEstudiante />}
        />
        <Route
          path="/encontrarestudiantes"
          element={<FormularioBusquedaEstudiante />}
        />
      </Route>

      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default App;
