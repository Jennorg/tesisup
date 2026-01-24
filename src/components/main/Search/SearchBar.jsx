import React, { useState, useRef, useEffect } from "react";
import { GoSearch } from "react-icons/go";

/**
 * Componente SearchBar
 * Barra de búsqueda con funcionalidad de "debounce" para optimizar las peticiones.
 *
 * @param {Object} props
 * @param {Function} props.setSearchQuery - Función para actualizar la consulta de búsqueda en el componente padre.
 * @param {Function} props.setPaginationData - Función para reiniciar la paginación al buscar.
 */
const SearchBar = ({ setSearchQuery, setPaginationData }) => {
  const [searchValue, setSearchValue] = useState("");
  const timeoutRef = useRef(null);

  // Limpiar timeout al desmontar el componente para evitar fugas de memoria
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleInput = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // Limpiar timeout anterior si el usuario sigue escribiendo
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Si el valor está vacío, limpiar la búsqueda inmediatamente sin esperar
    if (value.trim() === "") {
      setSearchQuery("");
      setPaginationData((prev) => ({ ...prev, page: 1 }));
      return;
    }

    // Crear nuevo timeout para ejecutar la búsqueda después de 300ms de inactividad (debounce)
    timeoutRef.current = setTimeout(() => {
      setSearchQuery(value.trim());
      // Resetear a la primera página cuando se realiza una nueva búsqueda
      setPaginationData((prev) => ({ ...prev, page: 1 }));
    }, 300);
  };

  return (
    <div className="flex max-h-12 w-full place-items-center border-2 rounded-lg relative transition-all duration-200 overflow-hidden">
      <input
        type="text"
        className="w-full pr-8 py-2 bg-transparent focus:outline-none"
        placeholder="Buscar tesis"
        value={searchValue}
        onChange={handleInput}
      />
      <div className="absolute right-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
        <GoSearch size={20} />
      </div>
    </div>
  );
};

export default SearchBar;
