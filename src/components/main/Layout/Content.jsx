import React from "react";
import CardList from "@/components/main/Card/CardList";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";

const Content = ({
  isAsideVisible,
  setIsTesisFormVisible,
  isLoading,
  tesisEncontradas,
  haBuscado,
  onEditTesis,
  onTesisDeleted, // <-- Aceptar la nueva prop
  error, // Pasar el error si existe
}) => {
  const marginLeftClass = isAsideVisible ? "ml-16" : "ml-0";

  return (
    <div
      className={`flex-grow w-full p-4 overflow-ellipsis transition-margin-left duration-300 ease-in-out ${marginLeftClass}`}
    >
      <CardList
        isLoading={isLoading}
        tesisEncontradas={tesisEncontradas}
        haBuscado={haBuscado}
        onEditTesis={onEditTesis}
        onTesisDeleted={onTesisDeleted} // <-- Pasar la prop a CardList
        error={error}
      />

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
