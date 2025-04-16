import React from "react";
import { useState } from "react";  
import axios from "axios";

import handleInputChange from "@/hooks/utils/handleInputChange";

const SignUp = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    ci: '',
    password: '',
    telefono: '',
  });

  const handleInput = (e) => {
    handleInputChange(e, setFormData)
  }

  const validateForm = () => {

    const payload = {
      ...formData,
      ci: parseInt(formData.ci),
      telefono: parseInt(formData.telefono),
    };

    console.log("Datos enviados al servidor:", payload); // para depurar

    axios.post('http://localhost:8080/api/profesor', payload)
    .then(res => console.log("Respuesta del servidor:", res.data))
    .catch(err => {
      console.error("Error al enviar:", err);
      console.log("Respuesta del servidor:", err.response?.data);
    });
  }

  return (
    <form className="grid place-items-center w-dvw h-dvh" onSubmit={validateForm}>
      <h1>Registro</h1>
      <input type="text" name="nombre" placeholder="Nombre" onChange={handleInput}/>
      <input type="text" name="apellido" placeholder="Apellido" onChange={handleInput}/>
      <input type="email" name="email" placeholder="Correo" onChange={handleInput}/>
      <input type="number" name="ci" placeholder="Cédula" onChange={handleInput}/>
      <input type="password" name="password" placeholder="Contraseña" onChange={handleInput}/>
      <input type="tel" name="telefono" placeholder="Telefono" onChange={handleInput}/>
      <button type="button">Cancelar</button>
      <button type="submit">Continuar</button>
    </form>
  )
}

export default SignUp