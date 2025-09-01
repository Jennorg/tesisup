import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "@/components/Home";
import Login from "@/components/Auth/Login";
import SignUp from "@/components/Auth/Signup";
import MainPage from "@/components/main/MainPage";
import Perfil from "@/components/Perfil/Perfil";
import BusquedaAvanzada from "@/components/detailSearch/DetailSearch";
// import BusquedaAvanzada from "src/components/detailSearch";
import FormularioRegistroEstudiante from "@/components/estudiantes/FormularioRegistroEstudiante";
import FormularioBusquedaEstudiante from "@/components/estudiantes/FormularioBusquedaEstudiante";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
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
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default App;
