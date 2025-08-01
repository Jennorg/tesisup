import { React, useState, useEffect } from "react";
import axios from 'axios';
import Card from "@/components/main/Card/Card";

const CardList = ({ tesisEncontradas, haBuscado }) => {
    const [tesis, setTesis] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTesis = async () => {
        setIsLoading(true);
        axios.get('http://localhost:8080/api/tesis')
            .then(res => {
                console.log(res);
                setTesis(res.data);
                setIsLoading(false);
            })
            .catch(err => {
                setError(err);
                setIsLoading(false);
            });
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
        <ul className="flex flex-col w-full gap-3">
            {isLoading && <p>Cargando tesis...</p>}
            {error && <p className="text-red-500">Error al cargar las tesis: {error.message}</p>}

            {!isLoading && !error && tesis.length > 0 && (
                tesis.map((data) => (
                    <li key={data.id} className="w-full">
                        <Card data={data} onDelete={eliminarTesisPorId} />
                    </li>
                ))
            )}

            {error && !isLoading && tesisEncontradas && (
                <p className="text-red-500">Error al cargar las tesis: {error.message}</p>
            )}

            {!isLoading && !error && tesisEncontradas.length === 0 && tesis.length === 0 && (
                <p>No hay tesis disponibles.</p>
            )}
        </ul>
    );
};

export default CardList;