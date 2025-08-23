import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Aside from "@/components/main/Layout/Aside";

const API_ESTUDIANTES = "http://localhost:8080/api/estudiantes";
const API_CARRERAS = "http://localhost:8080/api/carrera";

const FormularioBusquedaEstudiante = () => {
  const [ci, setCi] = useState("");
  const [resultado, setResultado] = useState(null);
  const [carrera, setCarrera] = useState(null);
  const [error, setError] = useState(null);
  const [isAsideVisible, setIsAsideVisible] = useState(true);
  const navigate = useNavigate();

  const buscar = async () => {
    if (!ci.trim()) {
      setError("Por favor ingresa un número de cédula válido.");
      return;
    }

    try {
      const resEstudiante = await axios.get(`${API_ESTUDIANTES}/ci/${ci}`);
      const estudiante = resEstudiante.data.data;
      setResultado(estudiante);
      setError(null);

      const resCarreras = await axios.get(API_CARRERAS);
      const listaCarreras = resCarreras.data.data;
      const carreraAsociada = listaCarreras.find(
        (c) => c.codigo === estudiante.codigoCarrera,
      );

      setCarrera(carreraAsociada || null);
    } catch (error) {
      setResultado(null);
      setCarrera(null);
      setError("Estudiante no encontrado o carrera no asociada.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      buscar();
    }
  };

  return (
    <div className="flex min-h-screen bg-blue-600">
      <Aside
        isAsideVisible={isAsideVisible}
        onToggleMenu={setIsAsideVisible}
        onProfileClick={() => navigate("/registrar-estudiante")}
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
            Buscar Estudiante
          </h2>

          <div className="space-y-4 mt-4">
            <div className="flex flex-col">
              <label htmlFor="ci" className="mb-1 text-sm font-semibold text-white">
                Cédula de Identidad
              </label>
              <input
                type="text"
                id="ci"
                value={ci}
                onChange={(e) => setCi(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ingrese número de cédula"
                className="border border-gray-300 p-2 rounded bg-white text-black"
              />
            </div>

            <button
              onClick={buscar}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
            >
              Buscar Estudiante
            </button>

            {resultado && (
              <div className="mt-4 p-4 border border-gray-600 rounded bg-gray-700 space-y-2">
                <h3 className="text-lg font-semibold mb-2">Datos del Estudiante</h3>
                <Campo label="Nombre" valor={resultado.nombre} />
                <Campo label="Apellido" valor={resultado.apellido} />
                <Campo label="Email" valor={resultado.email} />
                <Campo label="Teléfono" valor={resultado.telefono} />
              </div>
            )}

            {carrera && (
              <div className="mt-4 p-4 border border-gray-600 rounded bg-gray-700 space-y-2">
                <h3 className="text-lg font-semibold mb-2">Carrera Asociada</h3>
                <Campo label="Código de Carrera" valor={carrera.codigo} />
                <Campo label="Nombre de Carrera" valor={carrera.nombre} />
                <Campo label="Campo" valor={carrera.campo} />
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 border border-red-500 rounded bg-red-900">
                <p className="text-red-300 font-semibold">{error}</p>
              </div>
            )}

            <div className="mt-4">
              <button
                type="button"
                onClick={() => navigate("/registrar-estudiante")}
                className="w-full py-2 rounded text-white bg-green-600 hover:bg-green-700 font-semibold"
              >
                Registrar Nuevo Estudiante
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Campo = ({ label, valor }) => (
  <div className="flex flex-col">
    <label className="block text-white text-sm font-semibold mb-1">
      {label}:
    </label>
    <input
      type="text"
      value={valor}
      disabled
      className="border border-gray-500 p-2 rounded bg-gray-900 text-white"
    />
  </div>
);

export default FormularioBusquedaEstudiante; 