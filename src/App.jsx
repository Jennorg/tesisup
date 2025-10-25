import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "@/components/Auth/Login";
import SignUp from "@/components/Auth/Signup";
import MainPage from "@/components/main/MainPage";
import Auth from "@/utils/Auth";

const App = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/signUp" element={<SignUp />} />

      {/* Rutas protegidas: la ruta raíz (/) será MainPage y requerirá autenticación */}
      <Route element={<Auth />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/mainPage" element={<MainPage />} />
      </Route>

      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default App;
