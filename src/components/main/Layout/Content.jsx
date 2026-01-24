import React from "react";
import CardList from "@/components/main/Card/CardList";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";

/**
 * Componente Content
 * Contenedor principal para la lista de tarjetas de tesis.
 * Gestiona la visualización de errores, estados de carga y lista vacía.
 * También contiene el botón flotante (FAB) para añadir nuevas tesis.
 *
 * @param {Object} props
 * @param {Function} props.setIsTesisFormVisible - Función para mostrar/ocultar el formulario de creación.
 * @param {boolean} props.isLoading - Indica si se están cargando los datos.
 * @param {Array} props.tesisEncontradas - Lista de tesis a mostrar.
 * @param {boolean} props.haBuscado - Indica si ya se ha realizado una búsqueda inicial.
 * @param {Function} props.onEditTesis - Callback para editar una tesis.
 * @param {Function} props.onTesisDeleted - Callback tras eliminar una tesis.
 * @param {Function} props.onStatusChange - Callback para cambiar el estado de una tesis.
 * @param {string} props.error - Mensaje de error si existe.
 */
const Content = ({
  setIsTesisFormVisible,
  isLoading,
  tesisEncontradas,
  haBuscado,
  onEditTesis,
  onTesisDeleted,
  onStatusChange,
  error,
}) => {
  return (
    <div className="flex-grow w-full p-4 overflow-ellipsis transition-all duration-300 ease-in-out ml-0">
      {/* Visualización de Errores */}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}

      {/* Mensaje cuando no hay resultados (y no hay error) */}
      {!error && !isLoading && haBuscado && tesisEncontradas.length === 0 && (
        <p className="text-center mt-4 text-gray-600">
          No se encontraron tesis con los criterios de búsqueda.
        </p>
      )}

      {/* Renderizado de la lista de tarjetas */}
      {/* Se muestra si está cargando (para mostrar esqueletos) o si hay tesis encontradas */}
      {!error && (isLoading || tesisEncontradas.length > 0) && (
        <CardList
          isLoading={isLoading}
          tesisEncontradas={tesisEncontradas}
          haBuscado={haBuscado}
          onEditTesis={onEditTesis}
          onTesisDeleted={onTesisDeleted}
          onStatusChange={onStatusChange}
          error={error}
        />
      )}

      {/* Botón Flotante de Acción (FAB) para añadir tesis */}
      <div className="fixed bottom-10 right-10 z-10">
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setIsTesisFormVisible(true)}
        >
          <AddIcon />
        </Fab>
      </div>
    </div>
  );
};

export default Content;
