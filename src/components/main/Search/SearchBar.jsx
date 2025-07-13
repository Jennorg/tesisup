import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { GoSearch } from "react-icons/go";
import SearchOptions from "@/components/main/Search/SearchOptions";

const SearchBar = ({ setIsLoading, tesisEncontradas, setTesisEncontradas, setHaBuscado }) => {
    const [tesisABuscar, setTesisABuscar] = useState("");

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
            setHaBuscado(false);
            return;
        }
        try {
            setIsLoading(true);

            const res = await axios.get(`http://localhost:8080/api/tesis/cadena/${query}`);

            let dataToArray = res.data;
            setTesisEncontradas(dataToArray);
            setHaBuscado(true); // Marca que se ha buscado algo
            setIsLoading(false);

        } catch (error) {
            console.error("Error al obtener las tesis:", error);
            setTesisEncontradas([]);
        }
    }, []);

    // Debounced version of fetchtesisEncontradas
    const debouncedFetch = useCallback(debounce(fetchtesisEncontradas, 300), [fetchtesisEncontradas]);

    const handleInput = (e) => {
        const value = e.target.value;
        if (value.length > 0) {
            setTesisABuscar(value);
            setHaBuscado(true)
        } else {
            setTesisABuscar([]);
            setHaBuscado(false);
        }
        debouncedFetch(value);
        setShowOptions(value.trim() !== "" && tesisEncontradas.length > 0);
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
        </div>
    );
};

export default SearchBar;