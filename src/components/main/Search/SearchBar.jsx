import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { GoSearch } from "react-icons/go";
import handleInputChange from "@/hooks/utils/handleInputChange";
import SearchOptions from "@/components/main/Search/SearchOptions";

const SearchBar = ({ setIsLoading }) => {
    const [tesisABuscar, setTesisABuscar] = useState("");
    const [tesisEncontradas, setTesisEncontradas] = useState([]);
    const [showOptions, setShowOptions] = useState(false);

    // Debounce function to limit API calls
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Function to fetch search results
    const fetchtesisEncontradas = useCallback(async (query) => {
        if (!query.trim()) {
            setTesisEncontradas([]);
            setShowOptions(false);
            return;
        }
        try {
            setIsLoading(true);
            const res = await axios.get(`http://localhost:8080/api/tesis/${query}`);
            console.log("Respuesta completa:", res); // Para ver la estructura completa de la respuesta
            console.log("res.data antes de verificar:", res.data);

            let dataToArray = res.data;

            if (res.data && !Array.isArray(res.data)) {
                // Si res.data existe y no es un array, lo envolvemos en un array
                dataToArray = [res.data];
                console.log("res.data convertido a array:", dataToArray);
            } else if (!res.data) {
                // Si res.data es null o undefined, lo inicializamos como un array vacío
                dataToArray = [];
                console.log("res.data era null/undefined, inicializado como:", dataToArray);
            } else {
                console.log("res.data ya era un array:", dataToArray);
            }

            setTesisEncontradas(dataToArray);
            setShowOptions(dataToArray.length > 0); // Actualiza showOptions basado en la longitud del array
            setIsLoading(false);

        } catch (error) {
            console.error("Error al obtener las tesis:", error);
            setTesisEncontradas([]);
            setShowOptions(false);
        }
    }, []);

    // Debounced version of fetchtesisEncontradas
    const debouncedFetch = useCallback(debounce(fetchtesisEncontradas, 300), [fetchtesisEncontradas]);

    const handleInput = (e) => {
        const value = e.target.value;
        setTesisABuscar(value);
        debouncedFetch(value); // Call the debounced fetch
        setShowOptions(value.trim() !== "" && tesisEncontradas.length > 0); // Show if there's input and results
    };

    const handleBlur = () => {
        setTimeout(() => setShowOptions(false), 100);
    };

    const handleFocus = () => {
        if (tesisABuscar.trim() !== "" && tesisEncontradas.length > 0) {
            setShowOptions(true);
        }
    };

    return (
        <div className="flex max-h-8 place-items-center border-primary border-2 rounded-lg p-1 w-11/12 relative">
            <input
                type="text"
                className="text-primary w-full pr-8"
                placeholder="Buscar tesis"
                onChange={handleInput}
                onBlur={handleBlur}
                onFocus={handleFocus}
            />
            <GoSearch className="absolute right-1.5 text-primary pointer-events-none" />
            {showOptions && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-md shadow-md z-10">
                    <SearchOptions options={tesisEncontradas} />
                </div>
            )}
        </div>
    );
};

export default SearchBar;