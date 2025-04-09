import { React } from "react";
import { Link } from "react-router-dom";
import { FaBars } from "react-icons/fa6";
import { HiOutlineX } from "react-icons/hi";

const Aside = ({ isAsideVisible, onToggleMenu }) => {
  return (
    <aside className="">
      <button
        onClick={() => onToggleMenu(!isAsideVisible)}
        className="text-secundary rounded-md">
        {isAsideVisible ? <HiOutlineX /> : <FaBars />}
      </button>
      <ul
        className={`absolute top-10 left-0 grid place-items-start gap-2 m-2.5 ml-3.5 text-secundary transition-transform duration-300 ease-in-out ${isAsideVisible ? "translate-x-0" : "-translate-x-100"
          }`}
      >
        <Link to="/Perfil">Perfil</Link>
        <a>Tesis</a>
        <a>Ajustes</a>
      </ul>
    </aside>
  );
};

export default Aside;