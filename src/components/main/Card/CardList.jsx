import { React, useState, useEffect } from "react";
import Card from "@/components/main/Card/Card";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const VITE_API_URL = API_URL || "http://localhost:8080/api";

const CardList = () => {
  const [tesis, setTesis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTesis = async () => {
      try {
        const response = await axios.get(`${VITE_API_URL}/tesis`);
        setTesis(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTesis();
  }, []);

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
            tesis.map((data) => (
              <li key={data.id} className="w-full">
                <Card data={data} />
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
