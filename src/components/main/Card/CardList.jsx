import { React, useState, useEffect } from "react";
import axios from "axios";
import Card from "@/components/main/Card/Card";

// Mockup data para testing
const mockTesis = [
  {
    id: 1,
    nombre: "Sistema de Gestión de Inventarios para PYMES",
    autor: "María González",
    encargado: "Dr. Carlos Rodríguez",
    tutor: "Prof. Ana Martínez",
    fecha: "2024-01-15",
    estado: "Aprobada",
    sede: "Sede Principal",
    id_encargado: 1,
    id_tutor: 1,
    id_sede: 1,
  },
  {
    id: 2,
    nombre: "Aplicación Móvil para Control de Asistencia",
    autor: "Juan Pérez",
    encargado: "Dra. Laura Sánchez",
    tutor: "Prof. Roberto Díaz",
    fecha: "2024-02-20",
    estado: "En Revisión",
    sede: "Sede Norte",
    id_encargado: 2,
    id_tutor: 2,
    id_sede: 2,
  },
  {
    id: 3,
    nombre: "Plataforma Web de E-learning",
    autor: "Carmen López",
    encargado: "Dr. Miguel Torres",
    tutor: "Prof. Patricia Vega",
    fecha: "2024-03-10",
    estado: "Pendiente",
    sede: "Sede Sur",
    id_encargado: 3,
    id_tutor: 3,
    id_sede: 3,
  },
  {
    id: 4,
    nombre: "Sistema de Monitoreo de Energía Renovable",
    autor: "Roberto Silva",
    encargado: "Dra. Isabel Morales",
    tutor: "Prof. Fernando Ruiz",
    fecha: "2024-01-30",
    estado: "Aprobada",
    sede: "Sede Este",
    id_encargado: 4,
    id_tutor: 4,
    id_sede: 4,
  },
  {
    id: 5,
    nombre: "Aplicación de Gestión de Proyectos",
    autor: "Ana Torres",
    encargado: "Dr. Luis Mendoza",
    tutor: "Prof. Gabriela Castro",
    fecha: "2024-02-15",
    estado: "En Revisión",
    sede: "Sede Oeste",
    id_encargado: 5,
    id_tutor: 5,
    id_sede: 5,
  },
  {
    id: 6,
    nombre: "Sistema de Análisis de Datos Empresariales",
    autor: "Diego Ramírez",
    encargado: "Dra. Elena Vargas",
    tutor: "Prof. Carlos Jiménez",
    fecha: "2024-03-05",
    estado: "Pendiente",
    sede: "Sede Central",
    id_encargado: 6,
    id_tutor: 6,
    id_sede: 6,
  },
  {
    id: 7,
    nombre: "Plataforma de Comercio Electrónico",
    autor: "Sofia Herrera",
    encargado: "Dr. Antonio Rojas",
    tutor: "Prof. Mariana Flores",
    fecha: "2024-01-25",
    estado: "Aprobada",
    sede: "Sede Principal",
    id_encargado: 7,
    id_tutor: 7,
    id_sede: 7,
  },
];

const CardList = ({ tesisEncontradas, haBuscado }) => {
  const [tesis, setTesis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTesis = async () => {
    setIsLoading(true);
    // Simular delay de carga
    setTimeout(() => {
      setTesis(mockTesis);
      setIsLoading(false);
    }, 1000);

    // Comentado el código original para usar mockup
    // axios
    //   .get("http://localhost:8080/api/tesis")
    //   .then((res) => {
    //     console.log(res);
    //     setTesis(res.data);
    //     setIsLoading(false);
    //   })
    //   .catch((err) => {
    //     setError(err);
    //     setIsLoading(false);
    //   });
  };

  useEffect(() => {
    if (tesisEncontradas.length === 0 && !haBuscado) {
      fetchTesis();
    } else if (Array.isArray(tesisEncontradas)) {
      setTesis(tesisEncontradas);
    }
  }, [tesisEncontradas]);

  const eliminarTesisPorId = (id) => {
    setTesis((prevTesis) => prevTesis.filter((t) => t.id !== id));
  };

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {isLoading ? (
        // Mostrar skeletons mientras carga
        Array.from({ length: 6 }).map((_, index) => (
          <li key={`skeleton-${index}`} className="w-full">
            <Card isLoading={true} />
          </li>
        ))
      ) : (
        // Mostrar cards reales cuando ya cargó
        !error &&
        tesis.length > 0 &&
        tesis.map((data) => (
          <li key={data.id} className="w-full">
            <Card data={data} onDelete={eliminarTesisPorId} isLoading={false} />
          </li>
        ))
      )}

      {error && !isLoading && tesisEncontradas && (
        <p className="text-red-500">
          Error al cargar las tesis: {error.message}
        </p>
      )}

      {!isLoading &&
        !error &&
        tesisEncontradas.length === 0 &&
        tesis.length === 0 && <p>No hay tesis disponibles.</p>}
    </ul>
  );
};

export default CardList;
