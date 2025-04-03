import React from "react";
import { IoMdAdd } from "react-icons/io";

const AddButton = ({ isTesisFormVisible, onToggleMenu }) => {
  return (
    <button
      className="absolute rounded-full bg-primary bottom-5 right-5 h-12 w-12 place-items-center hover:shadow-xl transition-all duration-300 ease-in-out"
      onClick={() => onToggleMenu(!isTesisFormVisible)}
    >
      <IoMdAdd className="text-2xl" />
    </button>
  )
}

export default AddButton;