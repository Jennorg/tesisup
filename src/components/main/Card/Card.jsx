import React, { useState, useEffect } from "react";
import axios from "axios";
import formatDate from "@/hooks/utils/formatDate";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import Skeleton from "@mui/material/Skeleton";
import Button from "@mui/material/Button";

const Card = ({ data, onDelete, isLoading = false }) => {
  const [encargadoNombre, setEncargadoNombre] = useState("");
  const [tutorNombre, setTutorNombre] = useState("");
  const [sedeNombre, setSedeNombre] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);

  //       const encargadoRes = await axios.get(
  //         `http://localhost:8080/api/encargado/${data.id_encargado}`
  //       );
  //       const encargadoNombre = encargadoRes.data.data
  //         ? `${encargadoRes.data.data.nombre} ${encargadoRes.data.data.apellido}`
  //         : "Encargado desconocido";
  //       setEncargadoNombre(encargadoNombre);

  //       const tutorRes = await axios.get(
  //         `http://localhost:8080/api/profesor/${data.id_tutor}`
  //       );
  //       const tutorNombre = tutorRes.data.data
  //         ? `${tutorRes.data.data.nombre} ${tutorRes.data.data.apellido}`
  //         : "Tutor desconocido";
  //       setTutorNombre(tutorNombre);

  //       const sedeRes = await axios.get(
  //         `http://localhost:8080/api/sede/search/${data.id_sede}`
  //       );
  //       const sedeNombre = sedeRes.data.data?.nombre || "Sede desconocida";
  //       setSedeNombre(sedeNombre);

  //       setLoading(false);
  //     } catch (err) {
  //       setError("Error al cargar los datos");
  //       setLoading(false);
  //       console.error("Detalles del error:", err);
  //     }
  //   };

  //   fetchData();
  // }, [data.id_encargado, data.id_tutor, data.id_sede]);
  useEffect(() => {
    // Si isLoading viene como prop, usar ese valor
    if (isLoading !== undefined) {
      setLoading(isLoading);
      return;
    }

    // Simular delay de carga solo si no hay isLoading prop
    // setTimeout(() => {
    //   if (!data) {
    //     setLoading(true);
    //   }
    //   if (data.encargado) {
    //     setLoading(false);
    //   } else {
    //     setError("Error al cargar los datos");
    //     setLoading(false);
    //   }
    // }, 500);
  }, [isLoading, data]);

  const handleEliminar = async () => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar esta tesis?"
    );
    if (!confirmar) return;

    // try {
    //   await axios.delete(`http://localhost:8080/api/tesis/${data.id}`);
    //   alert("Tesis eliminada correctamente");
    //   onDelete?.(data.id);
    // } catch (err) {
    //   console.error("Error al eliminar tesis:", err);
    //   alert("Hubo un error al eliminar la tesis.");
    // }
  };

  if (loading || isLoading) {
    return (
      <div className="flex flex-col w-full gap-2 animate-pulse border-gray-800 border-2 p-4 rounded-lg">
        <Skeleton variant="text" width="60%" height={32} />
        <div className="space-y-2">
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="75%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" width="65%" />
        </div>
        <div className="flex gap-2">
          <Skeleton variant="rectangular" width={120} height={36} />
          <Skeleton variant="rectangular" width={100} height={36} />
        </div>
      </div>
    );
  }
  if (error) return <div className="text-red-500">{error}</div>;

  // const cardStyle = {
  //   transition: "transform 0.3s ease, box-shadow 0.3s ease",
  //   transform: isHovered ? "scale(1.015)" : "scale(1)",
  //   boxShadow: isHovered
  //     ? "0 6px 12px rgba(0, 0, 0, 0.1)"
  //     : "0 3px 6px rgba(0, 0, 0, 0.08)",
  // };

  return (
    <div
      className="flex flex-col border-2 border-primary rounded-lg p-4 w-full gap-3 place-content-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex flex-col gap-1">
        <h2>{data.nombre}</h2>
      </div>

      <div className="flex gap-2">
        <ul className="bg-gray-600 w-fit px-3 py-0.5 rounded-full text-white">
          <li className="decoration">{data.estado}</li>
        </ul>

        <p>{formatDate(data.fecha)}</p>

        <p>{data.sede}</p>
      </div>

      <div>
        <p>
          <b>Autor: </b>
          {data.autor}
        </p>
        <p>
          <b>Encargado: </b>
          {data.encargado}
        </p>
        <p>
          <b>Tutor: </b>
          {data.tutor}
        </p>
      </div>

      <p className="bg-gray-600 w-fit px-3 py-0.5 rounded-full text-white"></p>

      <div className="flex gap-2">
        <Button
          variant="outlined"
          startIcon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleEliminar();
          }}
        >
          Eliminar
        </Button>

        <Button
          variant="contained"
          endIcon={<DownloadIcon />}
          onClick={(e) => {
            e.stopPropagation();
            console.log("Descargar tesis:", data.nombre);
          }}
        >
          Descargar
        </Button>
      </div>
    </div>
  );
};

export default Card;
