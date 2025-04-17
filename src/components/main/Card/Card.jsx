import React, { useState, useEffect } from "react";
import axios from "axios";
import formatDate from "@/hooks/utils/formatDate";

const Card = ({ data }) => {
    const [encargadoNombre, setEncargadoNombre] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchEncargado = async () => {
            if (!data.id_encargado) {
                setEncargadoNombre("Sin asignar");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(
                    `http://localhost:8080/api/encargado/${data.id_encargado}`
                );

                // Debug: Verifica la estructura real de la respuesta
                console.log("Respuesta de la API:", response.data);

                // Extrae el nombre según la estructura de la API
                const nombre =
                    `${response.data.data.nombre} ${response.data.data.apellido}`
                    || "Encargado desconocido";

                setEncargadoNombre(nombre);

            } catch (err) {
                if (!err.message.includes("canceled")) {
                    setError("Error al cargar el encargado");
                    console.error("Detalles del error:", err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchEncargado();
        return () => controller.abort();
    }, [data.id_encargado]);

    if (loading) {
        return <div>Cargando información del encargado...</div>;
    }

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div className="grid grid-cols-12 border-2 border-primary rounded-lg p-2 w-full gap-3 place-content-center">
            <h2 className="col-span-12">{data.nombre}</h2>
            <p className="col-span-4 text-xs">Encargado: {encargadoNombre}</p>
            <p className="col-span-4 text-xs">Fecha: {formatDate(data.fecha)}</p>
            <p className="col-span-4 text-xs">Estado: {data.estado}</p>
        </div>
    );
};

export default Card;