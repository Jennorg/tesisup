import {React, useEffect, useState } from "react";
import { data, Link } from "react-router-dom";
import axios from 'axios'

import handleInputChange from "@/hooks/utils/handleInputChange";

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    telefono: '',
  });
  const [professorData, setProfessorData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleInput = (e) => {
    handleInputChange(e, setFormData)
  }

  const validateForm = async () => {
    setLoading(true)
    console.log(formData)
    await axios.get('http://localhost:8081/getProfesor', {
      params: {
        email: formData.email,
        telefono: formData.telefono,
      }
    })
    .then(res => console.log(res.data))
    .catch(err => console.log(err))

    setLoading(false)
  }
  
  return (
    <div className="grid place-items-center w-dvw h-dvh">
      <h1>Login</h1>
      <form action="" className="flex flex-col gap-2.5">
        <input className="border-white border-2" type="email" name="email" onChange={handleInput}></input>
        <input className="border-white border-2" type="password" name="telefono" onChange={handleInput}></input>
        <button type="button">Cancelar</button>
        <button type="button" onClick={validateForm} disabled={loading}>Continuar</button>
      </form>
    </div>
  );
}

export default Login;