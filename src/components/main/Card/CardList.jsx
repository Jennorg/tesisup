import { React, useState, useEffect, useCallback } from "react";
import Card from "@/components/main/Card/Card";
import axios from "axios";
import dayjs from "dayjs";

const API_URL = import.meta.env.VITE_API_URL;
const VITE_API_URL = API_URL || "http://localhost:8080/api";

const CardList = ({ filters }) => {
  const [tesis, setTesis] = useState([]);
  const [data, setData] = useState({
    profesores: [],
    encargados: [],
    estudiantes: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredTesis, setFilteredTesis] = useState([]);

  // ESTADO CLAVE: Contador para forzar la recarga
  const [reloadCounter, setReloadCounter] = useState(0);

  // FUNCIÓN CLAVE: Llama a esta función después de una eliminación exitosa
  const handleTesisDeleted = useCallback(() => {
    // Incrementar el contador para disparar el useEffect
    setReloadCounter((prev) => prev + 1);
  }, []);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
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
      console.log("Datos de tesis cargados.");
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  }, [reloadCounter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!filters) {
      setFilteredTesis(tesis);
      return;
    }

    const fNombre = (filters.nombre || "").trim().toLowerCase();
    const fAutor = filters.autor || "";
    const fEncargado = filters.encargado || "";
    const fTutor = filters.tutor || "";
    const fSede = filters.sede || "";
    const fEstado = filters.estado || "";
    const fechaDesde = filters.fechaDesde || null;
    const fechaHasta = filters.fechaHasta || null;

    const getId = (val) => {
      if (val === null || val === undefined || val === "") return null;
      if (typeof val === "object") return Number(val.ci ?? val.id ?? null);
      return Number(val);
    };

    const result = tesis.filter((t) => {
      // Nombre
      if (fNombre) {
        const nombre = (t.nombre || t.titulo || "").toLowerCase();
        if (!nombre.includes(fNombre)) return false;
      }

      // Autor
      if (fAutor) {
        const autoresArr = t.autores || [];
        const hasAutor = autoresArr.some(
          (a) => Number(a.ci) === Number(fAutor)
        );
        if (!hasAutor) return false;
      }

      // Encargado
      if (fEncargado) {
        const thesisEncargadoId = getId(
          t.id_encargado ?? t.encargado ?? (t.encargado_data || null)
        );
        if (thesisEncargadoId === null) return false;
        if (thesisEncargadoId !== Number(fEncargado)) return false;
      }

      // Tutor
      if (fTutor) {
        const thesisTutorId = getId(
          t.id_tutor ?? t.tutor ?? (t.tutor_data || null)
        );
        if (thesisTutorId === null) return false;
        if (thesisTutorId !== Number(fTutor)) return false;
      }

      // Sede
      if (fSede) {
        if (String(t.id_sede) !== String(fSede)) return false;
      }

      // Estado
      if (fEstado) {
        if (String(t.estado) !== String(fEstado)) return false;
      }

      // Fecha range
      if (fechaDesde || fechaHasta) {
        if (!t.fecha) return false;
        const tesisDate = dayjs(t.fecha);
        if (fechaDesde && tesisDate.isBefore(dayjs(fechaDesde), "day")) {
          return false;
        }
        if (fechaHasta && tesisDate.isAfter(dayjs(fechaHasta), "day")) {
          return false;
        }
      }

      return true;
    });

    setFilteredTesis(result);
  }, [tesis, data, filters]);

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
            filteredTesis.length > 0 &&
            filteredTesis.map((tesisItem) => (
              <li
                key={tesisItem.id_tesis || tesisItem.id || tesisItem.nombre}
                className="w-full"
              >
                {tesisItem && (
                  <Card
                    data={getFullTesisData(tesisItem)}
                    onTesisDeleted={handleTesisDeleted}
                  />
                )}
              </li>
            ))}

        {error && !isLoading && (
          <li className="col-span-full">
            <p
              className="text-center py-8"
              style={{ color: "var(--error-main)" }}
            >
              Error al cargar las tesis: {error.message}
            </p>
          </li>
        )}

        {!isLoading && !error && filteredTesis.length === 0 && (
          <li className="col-span-full">
            <p
              className="text-center py-8"
              style={{ color: "var(--text-secondary)" }}
            >
              No se encontraron tesis disponibles
            </p>
          </li>
        )}
      </ul>
    </div>
  );
};

export default CardList;
