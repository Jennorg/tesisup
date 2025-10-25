import { React, useState, useEffect } from "react";
import Card from "@/components/main/Card/Card";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const VITE_API_URL = API_URL || "http://localhost:8080/api";

const CardList = () => {
  const [tesis, setTesis] = useState([]);
  const [data, setData] = useState({
    profesores: [],
    encargados: [],
    estudiantes: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tesisRes, profesoresRes, encargadosRes, estudiantesRes] =
          await Promise.all([
            axios.get(`${VITE_API_URL}/tesis`),
            axios.get(`${VITE_API_URL}/profesor`),
            axios.get(`${VITE_API_URL}/encargado`),
            axios.get(`${VITE_API_URL}/estudiantes`),
          ]);

        setTesis(tesisRes.data || []);
        setData({
          profesores: profesoresRes.data.data || [],
          encargados: encargadosRes.data.data || [],
          estudiantes: estudiantesRes.data.data || [],
        });
        console.log(tesisRes.data);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFullTesisData = (tesisItem) => {
    const autor = data.estudiantes.find(
      (e) => String(e.ci) === String(tesisItem.id_estudiante)
    );
    const tutor = data.profesores.find(
      (p) => String(p.ci) === String(tesisItem.id_tutor)
    );
    const encargado = data.encargados.find(
      (e) => String(e.ci) === String(tesisItem.id_encargado)
    );

    return { ...tesisItem, autor, tutor, encargado };
  };

  return (
    <div className="w-full">
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <li key={`skeleton-${index}`} className="w-full">
                <Card isLoading={true} />
              </li>
            ))
          : !error &&
            tesis.length > 0 &&
            tesis.map((tesisItem) => (
              <li
                key={tesisItem.id_tesis || tesisItem.id || tesisItem.nombre}
                className="w-full"
              >
                <Card data={getFullTesisData(tesisItem)} />
              </li>
            ))}

        {error && !isLoading && (
          <li className="col-span-full">
            <p className="text-red-500 text-center py-8">
              Error al cargar las tesis: {error.message}
            </p>
          </li>
        )}

        {!isLoading && !error && tesis.length === 0 && (
          <li className="col-span-full">
            <p className="text-gray-400 text-center py-8">
              No hay tesis disponibles.
            </p>
          </li>
        )}
      </ul>
    </div>
  );
};

export default CardList;
