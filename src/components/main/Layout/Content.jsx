import React from "react";
import CardList from "@/components/main/Card/CardList";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";

const Content = ({
  setIsTesisFormVisible,
  isLoading,
  tesisEncontradas,
  haBuscado,
  onEditTesis,
  onTesisDeleted, // <-- Aceptar la nueva prop
  onStatusChange, // <-- Aceptar la prop para actualizar estado
  error, // Pasar el error si existe
}) => {

  return (
    <div
      className="flex-grow w-full p-4 overflow-ellipsis transition-all duration-300 ease-in-out ml-0"
    >
          {error && (
          <p className="text-red-500 text-center mt-4">
            {error}
          </p>
        )}
        {/* No results message when there are no tesis and no error */}
        {!error && !isLoading && haBuscado && tesisEncontradas.length === 0 && (
          <p className="text-center mt-4 text-gray-600">
            No se encontraron tesis con los criterios de búsqueda.
          </p>
        )}
        {/* Render CardList only when there is at least one tesis */}
        {!error && tesisEncontradas.length > 0 && (
          <CardList
            isLoading={isLoading}
            tesisEncontradas={tesisEncontradas}
            haBuscado={haBuscado}
            onEditTesis={onEditTesis}
            onTesisDeleted={onTesisDeleted} // <--- Pasar la prop a CardList
            onStatusChange={onStatusChange} // <--- Pasar la prop a CardList
            error={error}
          />
        )}

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
