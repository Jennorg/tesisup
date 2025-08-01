import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "@/components/Home";
import Login from "@/components/Auth/Login";
import SignUp from "@/components/Auth/Signup";
import MainPage from "@/components/main/MainPage";
import Perfil from "@/components/Perfil/Perfil";
import PerfilEstudiantes from "@/components/estudiantes/perfil_estudiantes";
import EncontrarEstudiantes from "@/components/estudiantes/encontrarestudiantes";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/mainPage" element={<MainPage />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/perfil_estudiantes" element={<PerfilEstudiantes />} />
      <Route path="/encontrarestudiantes" element={<EncontrarEstudiantes />} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default App;