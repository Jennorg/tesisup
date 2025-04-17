import React, { useState, useEffect } from "react";
import axios from "axios";
import formatDate from "@/hooks/utils/formatDate";

const Card = ({ data }) => {
    const [encargadoNombre, setEncargadoNombre] = useState("");
    const [tutorNombre, setTutorNombre] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estado para manejar el efecto hover
    const [isHovered, setIsHovered] = useState(false);

    // Estado para manejar el estado de expansión de la tarjeta
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setLoading(true);  // Iniciar el estado de carga

                // Obtener información del encargado
                const encargadoResponse = await axios.get(
                    `http://localhost:8080/api/encargado/${data.id_encargado}`
                );
                const encargadoNombre = encargadoResponse.data.data
                    ? `${encargadoResponse.data.data.nombre} ${encargadoResponse.data.data.apellido}`
                    : "Encargado desconocido";
                setEncargadoNombre(encargadoNombre);

                // Obtener información del tutor
                const tutorResponse = await axios.get(
                    `http://localhost:8080/api/profesor/${data.id_tutor}`
                );
                // Concatenar nombre y apellido del tutor
                const tutorNombre = tutorResponse.data.data
                    ? `${tutorResponse.data.data.nombre} ${tutorResponse.data.data.apellido}`
                    : "Tutor desconocido";
                setTutorNombre(tutorNombre);

                setLoading(false);  // Finaliza la carga
            } catch (err) {
                setError("Error al cargar los datos");
                setLoading(false);  // Finaliza la carga en caso de error
                console.error("Detalles del error:", err);
            }
        };

        fetchData();

        return () => controller.abort();
    }, [data.id_encargado, data.id_tutor]);

    if (loading) {
        return <div>Cargando información...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    // Estilo en línea para la tarjeta con hover
    const cardStyle = {
        transition: "transform 0.3s ease, box-shadow 0.3s ease", // Transiciones suaves
        transform: isHovered ? "scale(1.015)" : "scale(1)", // Aumento de tamaño al hacer hover
        boxShadow: isHovered
            ? "0 6px 12px rgba(0, 0, 0, 0.1)" // Sombra más reducida en hover
            : "0 3px 6px rgba(0, 0, 0, 0.08)", // Sombra suave por defecto
    };

    return (
        <div
            className="grid grid-cols-12 border-2 border-primary rounded-lg p-2 w-full gap-3 place-content-center"
            style={cardStyle} // Aplica el estilo dinámico
            onMouseEnter={() => setIsHovered(true)} // Activa el hover al entrar el mouse
            onMouseLeave={() => setIsHovered(false)} // Desactiva el hover al salir el mouse
            onClick={() => setIsExpanded(!isExpanded)} // Cambia el estado de expansión al hacer clic
        >
            <h2 className="col-span-12">{data.nombre}</h2>
            <p className="col-span-4 text-xs">Encargado: {encargadoNombre}</p>
            <p className="col-span-4 text-xs">Fecha: {formatDate(data.fecha)}</p>
            <p className="col-span-4 text-xs">Estado: {data.estado}</p>

            {/* Mostrar datos adicionales si la tarjeta está expandida */}
            {isExpanded && (
                <div className="col-span-12 mt-3 text-xs grid grid-cols-12 gap-3">
                    <p className="col-span-4">CI Encargado: {data.id_encargado}</p>
                    <p className="col-span-4">CI Tutor: {data.id_tutor}</p>
                    <p className="col-span-4">Tutor: {tutorNombre}</p>
                </div>
            )}
        </div>
    );
};

export default Card;
