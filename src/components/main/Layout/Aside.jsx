import { FaBars } from "react-icons/fa6";
import { HiOutlineX } from "react-icons/hi";

const Aside = ({ isAsideVisible, onToggleMenu, onProfileClick, onTesisClick, onAjustesClick }) => {
  return (
    <aside className="relative">
      <button
        onClick={() => onToggleMenu(!isAsideVisible)}
        className="text-secundary rounded-md"
      >
        {isAsideVisible ? <HiOutlineX /> : <FaBars />}
      </button>

      
      <ul
        className={`absolute top-10 left-0 grid place-items-start gap-2 m-2.5 ml-3.5 text-secundary transition-transform duration-300 ease-in-out 
          ${isAsideVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
      >
        <button onClick={onProfileClick} className="text-secundary">Perfil</button>
        <button onClick={onTesisClick} className="text-secundary">Tesis</button>
        <button onClick={onAjustesClick} className="text-secundary">Ajustes</button>
      </ul>
    </aside>
  );
};

export default Aside;
