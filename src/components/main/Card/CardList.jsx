import React from "react";
import Card from "@/components/main/Card/Card";

/**
 * Componente CardList
 * Renderiza una cuadrícula de tarjetas de tesis.
 *
 * @param {Object} props
 * @param {boolean} props.isLoading - Muestra esqueletos de carga si es true.
 * @param {Array} props.tesisEncontradas - Array de objetos de tesis a mostrar.
 * @param {Function} props.onEditTesis - Función al hacer clic en editar.
 * @param {boolean} props.haBuscado - Indica si se ha realizado una búsqueda.
 * @param {string|Object} props.error - Objeto o mensaje de error.
 * @param {Function} props.onTesisDeleted - Callback tras eliminar una tesis.
 * @param {Function} props.onStatusChange - Callback al cambiar estado de una tesis.
 */
const CardList = ({
  isLoading,
  tesisEncontradas,
  onEditTesis,
  haBuscado,
  error,
  onTesisDeleted,
  onStatusChange,
}) => {
  // Renderiza los esqueletos de carga si está cargando
  if (isLoading) {
    return (
      <div className="w-full">
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
          {Array.from({ length: 6 }).map((_, index) => (
            <li key={`skeleton-${index}`} className="w-full">
              <Card isLoading={true} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Renderiza mensaje de error
  if (error) {
    return (
      <div className="col-span-full text-center py-8 text-red-500">
        <p>Error al cargar las tesis: {error.message || error}</p>
      </div>
    );
  }

  // Renderiza mensaje de "sin resultados"
  if (haBuscado && tesisEncontradas.length === 0) {
    return (
      <div className="col-span-full text-center py-8 text-gray-500">
        <p>No se encontraron tesis disponibles</p>
      </div>
    );
  }

  // Renderiza la lista de tarjetas
  return (
    <div className="w-full">
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
        {tesisEncontradas.map((tesisItem) => (
          <li key={tesisItem.id_tesis || tesisItem.id} className="w-full">
            <Card
              data={tesisItem}
              onTesisDeleted={onTesisDeleted}
              onEdit={() => onEditTesis(tesisItem)}
              onStatusChange={onStatusChange}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CardList;
