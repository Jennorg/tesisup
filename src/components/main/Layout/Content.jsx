import { React, useState } from "react";
import CardList from "@/components/main/Card/CardList"
import AddButton from "@/components/main/Ui/addButton";
import Spiner from "@/hooks/Modals/LoadingSpinner"

const Content = ({ isAsideVisible, isTesisFormVisible, setIsTesisFormVisible, isLoading, tesisEncontradas, haBuscado }) => {
  const marginLeftClass = isAsideVisible ? 'ml-16' : 'ml-0';

  return (
    <div className={`flex-grow w-full p-4 overflow-ellipsis transition-margin-left duration-300 ease-in-out ${marginLeftClass}`}>

      {}
      <div>
        <CardList
          tesisEncontradas={tesisEncontradas}
          haBuscado={haBuscado}
        />
        <AddButton isTesisFormVisible={isTesisFormVisible} onToggleMenu={setIsTesisFormVisible} />
      </div>
      {/* ) : <Spiner />} */}

    </div>
  )
}

export default Content;