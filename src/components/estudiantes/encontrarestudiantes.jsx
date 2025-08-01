import { useState } from "react";
import axios from "axios";

const API_ESTUDIANTES = "http://localhost:8080/api/estudiantes";
const API_CARRERAS = "http://localhost:8080/api/carrera";

const EncontrarEstudiantes = () => {
  const [ci, setCi] = useState("");
  const [resultado, setResultado] = useState(null);
  const [carrera, setCarrera] = useState(null);
  const [error, setError] = useState(null);

  const buscar = async () => {
    try {
      const resEstudiante = await axios.get(`${API_ESTUDIANTES}/ci/${ci}`);
      const estudiante = resEstudiante.data.data;
      setResultado(estudiante);
      setError(null);

      const resCarreras = await axios.get(API_CARRERAS);
      const listaCarreras = resCarreras.data.data;
      const carreraAsociada = listaCarreras.find(
        (c) => c.codigo === estudiante.codigoCarrera
      );

      setCarrera(carreraAsociada || null);
    } catch (err) {
      setResultado(null);
      setCarrera(null);
      setError("Estudiante no encontrado o carrera no asociada.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-800 p-4">
      <div className="p-6 max-w-xl w-full bg-neutral-800 shadow-lg rounded text-white">
        <h2 className="text-2xl font-bold mb-4 text-center">Buscar Estudiante</h2>

        <input
          type="text"
          value={ci}
          onChange={(e) => setCi(e.target.value)}
          placeholder="Ingrese CI"
          className="border border-neutral-600 p-2 rounded w-full bg-neutral-900 text-white mb-4"
        />

        <button
          onClick={buscar}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Buscar
        </button>

        {resultado && (
          <div className="mt-4 p-4 border border-neutral-600 rounded bg-neutral-700 space-y-2">
            <h3 className="text-lg font-semibold mb-2">Datos del Estudiante</h3>
            <Campo label="Nombre" valor={resultado.nombre} />
            <Campo label="Apellido" valor={resultado.apellido} />
            <Campo label="Email" valor={resultado.email} />
            <Campo label="Teléfono" valor={resultado.telefono} />
          </div>
        )}

        {carrera && (
          <div className="mt-4 p-4 border border-neutral-600 rounded bg-neutral-700 space-y-2">
            <h3 className="text-lg font-semibold mb-2">Carrera Asociada</h3>
            <Campo label="Código de Carrera" valor={carrera.codigo} />
            <Campo label="Nombre de Carrera" valor={carrera.nombre} />
            <Campo label="Campo" valor={carrera.campo} />
          </div>
        )}

        {error && <p className="mt-4 text-red-400 font-semibold">{error}</p>}
      </div>
    </div>
  );
};

const Campo = ({ label, valor }) => (
  <label className="block text-white">
    {label}:
    <input
      type="text"
      value={valor}
      disabled
      className="border border-neutral-500 p-1 rounded w-full bg-neutral-900 text-white"
    />
  </label>
);

export default EncontrarEstudiantes;