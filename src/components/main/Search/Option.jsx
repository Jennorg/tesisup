import React from "react";

/**
 * Componente Option
 * Renderiza una opción individual dentro de una lista de resultados o sugerencias.
 *
 * @param {Object} props
 * @param {string} props.data - Texto o contenido a mostrar en la opción.
 */
const Option = ({ data }) => {
  return <li className="text-primary">{data}</li>;
};
export default Option;
