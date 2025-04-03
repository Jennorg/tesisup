import { React, useState } from "react";
import CardList from "@/components/main/CardList"
import AddButton from "@/components/main/addButton";
import TesisForm from "@/components/main/tesisForm";

const Content = ({ isAsideVisible, isTesisFormVisible, setIsTesisFormVisible }) => {
  const marginLeftClass = isAsideVisible ? 'ml-16' : 'ml-0';

  return (
    <div className={`flex-grow w-full p-4 overflow-ellipsis transition-margin-left duration-300 ease-in-out ${marginLeftClass}`}>

      <CardList />
      <AddButton isTesisFormVisible={isTesisFormVisible} onToggleMenu={setIsTesisFormVisible} />

    </div>
  )
}

export default Content;