import React from "react";
import Card from "@/components/main/Card/Card";

const CardList = ({
  isLoading,
  tesisEncontradas,
  onEditTesis,
  haBuscado, // Se mantiene para saber si mostrar el mensaje de "no encontrados"
  error, // Opcional: para manejar errores desde MainPage
  onTesisDeleted, // Para refrescar la lista
}) => {
  // El componente ahora es mucho más simple. Solo se encarga de renderizar.

  // Renderiza los esqueletos de carga
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

  // Renderiza un mensaje de error si lo hay
  if (error) {
    return (
      <div className="col-span-full text-center py-8 text-red-500">
        <p>Error al cargar las tesis: {error.message}</p>
      </div>
    );
  }

  // Renderiza el mensaje de "no encontrados" solo si se ha buscado y no hay resultados
  if (haBuscado && tesisEncontradas.length === 0) {
    return (
      <div className="col-span-full text-center py-8 text-gray-500">
        <p>No se encontraron tesis disponibles</p>
      </div>
    );
  }

  // Renderiza la lista de tesis
  return (
    <div className="w-full">
      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
        {tesisEncontradas.map((tesisItem) => (
          <li
            key={tesisItem.id_tesis || tesisItem.id}
            className="w-full"
          >
            <Card
              data={tesisItem} // Asumimos que la data ya viene completa
              onTesisDeleted={onTesisDeleted}
              onEdit={() => onEditTesis(tesisItem)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CardList;