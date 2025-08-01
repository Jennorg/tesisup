import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import handleInputChange from "@/hooks/utils/handleInputChange";

const SignUp = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    ci: "",
    password: "",
    telefono: "",
    id_sede: "",
  });

  const [mensaje, setMensaje] = useState(null);
  const navigate = useNavigate(); 

  const handleInput = (e) => {
    handleInputChange(e, setFormData);
  };

  const validateForm = () => {
    const payload = {
      ...formData,
      ci: parseInt(formData.ci),
      telefono: formData.telefono,
      id_sede: parseInt(formData.id_sede),
    };

    console.log("Datos enviados al servidor:", payload);

    axios
      .post("http://localhost:8080/api/encargado", payload)
      .then((res) => {
        console.log("Respuesta del servidor:", res.data);
        setMensaje(" Encargado creado correctamente");
      })
      .catch((err) => {
        console.error("Error al enviar:", err);
        setMensaje(err.response?.data?.message || " Error al registrar encargado");
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-screen bg-blue-600">
      <form
        className="p-6 bg-gray-800 shadow-lg rounded-lg flex flex-col gap-6 w-full max-w-md text-center"
        onSubmit={(e) => {
          e.preventDefault();
          validateForm();
        }}
      >
        <img src="/img/uneg-logo.png" alt="Logo UNEG" className="mx-auto w-24 h-24" />
        <h1 className="text-2xl font-bold text-white">Registro</h1>

        {[
          { name: "nombre", type: "text", label: "Nombre", placeholder: "Ej: Juan" },
          { name: "apellido", type: "text", label: "Apellido", placeholder: "Ej: Pérez" },
          { name: "email", type: "email", label: "Correo", placeholder: "Ej: correo@ejemplo.com" },
          { name: "ci", type: "number", label: "Cédula", placeholder: "Ej: 12345678" },
          { name: "password", type: "password", label: "Contraseña", placeholder: "Ej: ********" },
          { name: "telefono", type: "tel", label: "Teléfono", placeholder: "Ej: +584121234567" },
        ].map(({ name, type, label, placeholder }) => (
          <div key={name} className="flex flex-col text-left">
            <label htmlFor={name} className="text-white font-medium">{label}</label>
            <input
              className="border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 w-full bg-gray-700 text-white"
              type={type}
              name={name}
              id={name}
              placeholder={placeholder}
              onChange={handleInput}
            />
          </div>
        ))}

        {}
        <div className="flex flex-col text-left">
          <label htmlFor="id_sede" className="text-white font-medium">Sede</label>
          <select
            name="id_sede"
            id="id_sede"
            className="border border-gray-500 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 w-full bg-gray-700 text-white"
            onChange={handleInput}
            value={formData.id_sede}
          >
            <option value="">Selecciona una sede</option>
            <option value="1">Puerto Ordaz</option>
            <option value="2">Ciudad Bolívar</option>
            <option value="3">Upata</option>
            <option value="4">Tumeremo</option>
          </select>
        </div>

        {}
        {mensaje && (
          <div className="text-white bg-gray-700 p-2 rounded border border-gray-500 text-sm">
            {mensaje}
          </div>
        )}

        {}
        <div className="flex justify-between mt-4">
          <button
            type="button"
            onClick={() => navigate(-1)} 
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUp;