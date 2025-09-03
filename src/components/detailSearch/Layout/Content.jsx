import React from "react";
import CardList from "@/components/main/Card/CardList";

const Content = ({ tesisEncontradas, haBuscado }) => {
  return (
    <div className="flex-grow w-full p-4">
      <CardList tesisEncontradas={tesisEncontradas} haBuscado={haBuscado} />
    </div>
  );
};

export default Content;
