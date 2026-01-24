import React from "react";
import Option from "@/components/main/Search/Option";

/**
 * Componente SearchOptions
 * Renderiza una lista de opciones de búsqueda sugeridas.
 * Actualmente este componente parece ser un esqueleto o base para futura implementación de autocompletado.
 *
 * @param {Object} props
 * @param {Array} props.options - Array de objetos con las opciones a mostrar (espera {id, nombre}).
 */
const SearchOptions = ({ options }) => {
  return (
    <ul>
      {options.map((option) => (
        <Option key={option.id || option.nombre} data={option.nombre} />
      ))}
    </ul>
  );
};

export default SearchOptions;
