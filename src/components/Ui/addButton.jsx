import React from "react";
import { IoMdAdd } from "react-icons/io";

/**
 * Componente AddButton
 * Botón flotante para alternar la visibilidad del menú o formulario de creación.
 * Aunque parece ser un botón inferior derecho fijo, las clases 'absolute' sugieren que depende de un contenedor relativo.
 *
 * @param {Object} props
 * @param {boolean} props.isTesisFormVisible - Estado actual de visibilidad.
 * @param {Function} props.onToggleMenu - Función para cambiar la visibilidad.
 */
const AddButton = ({ isTesisFormVisible, onToggleMenu }) => {
  return (
    <button
      className="absolute rounded-full bg-primary bottom-5 right-5 h-12 w-12 place-items-center hover:shadow-xl transition-all duration-300 ease-in-out"
      onClick={() => onToggleMenu(!isTesisFormVisible)}
    >
      <IoMdAdd className="text-2xl" />
    </button>
  );
};

export default AddButton;
