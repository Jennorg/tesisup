import React, { useState, useRef, useEffect } from "react";
import { GoSearch } from "react-icons/go";

const SearchBar = ({
  setSearchQuery,
  setPaginationData,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Limpiar timeout al desmontar
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleInput = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Si el valor está vacío, limpiar la búsqueda inmediatamente
    if (value.trim() === "") {
      setSearchQuery("");
      setPaginationData((prev) => ({ ...prev, page: 1 }));
      return;
    }

    // Crear nuevo timeout para debounce
    timeoutRef.current = setTimeout(() => {
      setSearchQuery(value.trim());
      // Resetear a la primera página cuando se busca
      setPaginationData((prev) => ({ ...prev, page: 1 }));
    }, 300);
  };

  return (
    <div className="flex max-h-10 max-w-2xl p-3 place-items-center border-2 rounded-lg w-11/12 relative">
      <input
        type="text"
        className="w-full pr-8"
        placeholder="Buscar tesis"
        value={searchValue}
        onChange={handleInput}
      />
      <GoSearch className="pointer-events-none" />
    </div>
  );
};

export default SearchBar;
