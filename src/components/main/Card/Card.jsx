import React, { useState, useEffect } from "react";
import axios from "axios";
import formatDate from "@/hooks/utils/formatDate";

const Card = ({ data, onDelete }) => {
  const [encargadoNombre, setEncargadoNombre] = useState("");
  const [tutorNombre, setTutorNombre] = useState("");
  const [sedeNombre, setSedeNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const encargadoRes = await axios.get(`http://localhost:8080/api/encargado/${data.id_encargado}`);
        const encargadoNombre = encargadoRes.data.data
          ? `${encargadoRes.data.data.nombre} ${encargadoRes.data.data.apellido}`
          : "Encargado desconocido";
        setEncargadoNombre(encargadoNombre);

        const tutorRes = await axios.get(`http://localhost:8080/api/profesor/${data.id_tutor}`);
        const tutorNombre = tutorRes.data.data
          ? `${tutorRes.data.data.nombre} ${tutorRes.data.data.apellido}`
          : "Tutor desconocido";
        setTutorNombre(tutorNombre);

        const sedeRes = await axios.get(`http://localhost:8080/api/sede/search/${data.id_sede}`);
        const sedeNombre = sedeRes.data.data?.nombre || "Sede desconocida";
        setSedeNombre(sedeNombre);

        setLoading(false);
      } catch (err) {
        setError("Error al cargar los datos");
        setLoading(false);
        console.error("Detalles del error:", err);
      }
    };

    fetchData();
  }, [data.id_encargado, data.id_tutor, data.id_sede]);

  const handleEliminar = async () => {
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar esta tesis?");
    if (!confirmar) return;

    try {
      await axios.delete(`http://localhost:8080/api/tesis/${data.id}`);
      alert("Tesis eliminada correctamente");
      onDelete?.(data.id); 
    } catch (err) {
      console.error("Error al eliminar tesis:", err);
      alert("Hubo un error al eliminar la tesis.");
    }
  };

  if (loading) return <div>Cargando información...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  const cardStyle = {
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    transform: isHovered ? "scale(1.015)" : "scale(1)",
    boxShadow: isHovered
      ? "0 6px 12px rgba(0, 0, 0, 0.1)"
      : "0 3px 6px rgba(0, 0, 0, 0.08)",
  };

  return (
    <div
      className="grid grid-cols-12 border-2 border-primary rounded-lg p-2 w-full gap-3 place-content-center"
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <h2 className="col-span-12 font-semibold">{data.nombre}</h2>
      <p className="col-span-4 text-xs">Encargado: {encargadoNombre}</p>
      <p className="col-span-4 text-xs">Fecha: {formatDate(data.fecha)}</p>
      <p className="col-span-4 text-xs">Estado: {data.estado}</p>

      {isExpanded && (
        <div className="col-span-12 mt-3 text-xs grid grid-cols-12 gap-3">
          <p className="col-span-4">CI Encargado: {data.id_encargado}</p>
          <p className="col-span-4">Tutor: {tutorNombre} (CI: {data.id_tutor})</p>
          <p className="col-span-4">Sede: {sedeNombre}</p>

          <div className="col-span-12 flex justify-end mt-4 gap-3">
            <a
              href={`http://localhost:8080/api/tesis/${data.id}/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              Descargar tesis
            </a>

            <button
              onClick={(e) => {
                e.stopPropagation(); 
                handleEliminar();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-semibold"
            >
              Eliminar tesis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;