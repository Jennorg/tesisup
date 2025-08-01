import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Aside from "@/components/main/Layout/Aside";

const API_CARRERAS = "http://localhost:8080/api/carrera";
const API_ESTUDIANTES = "http://localhost:8080/api/estudiantes";

const emptyForm = {
  ci: "",
  nombreEstudiante: "",
  apellido: "",
  email: "",
  telefono: "",
  codigo: "",
  nombre: "",
  campo: ""
};

const PerfilEstudiante = () => {
  const [form, setForm] = useState(emptyForm);
  const [isAsideVisible, setIsAsideVisible] = useState(true);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      ci, nombreEstudiante, apellido, email, telefono, codigo, nombre, campo
    } = form;

    if (!ci || !nombreEstudiante || !apellido || !email || !telefono || !codigo || !nombre || !campo) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      await axios.post(API_CARRERAS, {
        codigo: Number(codigo),
        nombre: nombre.trim(),
        campo: campo.trim()
      });

      await axios.post(API_ESTUDIANTES, {
        ci: Number(ci),
        nombre: nombreEstudiante.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        codigoCarrera: Number(codigo)
      });

      alert("Estudiante y carrera registrados con éxito");
      setForm(emptyForm);
    } catch (error) {
      const mensaje = error.response?.data?.message || error.message;
      console.error("Error:", mensaje);
      alert("Ocurrió un error: " + mensaje);
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-600">
      <Aside
        isAsideVisible={isAsideVisible}
        onToggleMenu={setIsAsideVisible}
        onProfileClick={() => navigate("/perfil_estudiantes")}
        onTesisClick={() => navigate("/mainPage")}
        onAjustesClick={() => alert("Ajustes no implementado aún")}
      />

      <main className="flex-grow pl-4 pr-4 py-6 bg-blue-600">
        <div className="relative p-6 max-w-xl mx-auto bg-gray-800 text-white shadow-md rounded">
          <div className="absolute top-4 left-4">
            <button
              onClick={() => navigate(-1)}
              className="text-sm text-white bg-blue-700 px-3 py-1 rounded hover:bg-blue-800 font-medium"
            >
              Volver
            </button>
          </div>

          <div className="absolute top-4 right-4">
            <button
              onClick={() => navigate("/mainPage")}
              className="text-sm text-white bg-blue-700 px-3 py-1 rounded hover:bg-blue-800 font-medium"
            >
              Inicio
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-center mt-4">
            Registrar Estudiante y Carrera
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Cédula de Identidad" name="ci" value={form.ci} onChange={handleChange} />
              <Input label="Nombre del Estudiante" name="nombreEstudiante" value={form.nombreEstudiante} onChange={handleChange} />
              <Input label="Apellido" name="apellido" value={form.apellido} onChange={handleChange} />
              <Input label="Correo Electrónico" name="email" type="email" value={form.email} onChange={handleChange} />
            </div>

            <Input label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Código de Carrera" name="codigo" value={form.codigo} onChange={handleChange} />
              <Input label="Nombre de Carrera" name="nombre" value={form.nombre} onChange={handleChange} />
            </div>

            <Input label="Campo" name="campo" value={form.campo} onChange={handleChange} />

            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <button
                type="submit"
                className="w-full py-2 rounded text-white bg-green-600 hover:bg-green-700 font-semibold"
              >
                Crear Estudiante
              </button>
              <button
                type="button"
                onClick={() => navigate("/encontrarestudiantes")}
                className="w-full py-2 rounded text-white bg-indigo-600 hover:bg-indigo-700 font-semibold"
              >
                Buscar estudiantes
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

const Input = ({ label, name, value, onChange, type = "text" }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="mb-1 text-sm font-semibold text-white">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      placeholder={`Ingresa ${label.toLowerCase()}`}
      value={value}
      onChange={onChange}
      className="border border-gray-300 p-2 rounded bg-white text-black"
    />
  </div>
);

export default PerfilEstudiante;