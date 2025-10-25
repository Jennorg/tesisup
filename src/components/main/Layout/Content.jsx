import { React, useState } from "react";
import CardList from "@/components/main/Card/CardList";

import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";

const Content = ({
  isAsideVisible,
  isTesisFormVisible,
  setIsTesisFormVisible,
  isLoading,
  tesisEncontradas,
  haBuscado,
  reloadKey,
  filters,
}) => {
  const marginLeftClass = isAsideVisible ? "ml-16" : "ml-0";

  return (
    <div
      className={`flex-grow w-full p-4 overflow-ellipsis transition-margin-left duration-300 ease-in-out ${marginLeftClass}`}
    >
  <CardList reloadKey={reloadKey} tesisEncontradas={tesisEncontradas} haBuscado={haBuscado} filters={filters} />

      <div className="absolute bottom-20 right-10 z-10">
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
