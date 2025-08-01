import { FaBars } from "react-icons/fa6";
import { HiOutlineX } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const Aside = ({
  isAsideVisible,
  onToggleMenu,
  onProfileClick,
  onTesisClick,
  onAjustesClick,
}) => {
  const navigate = useNavigate();

  return (
    <aside className="z-50">
      {}
      <button
        onClick={() => onToggleMenu(!isAsideVisible)}
        className="text-white p-2 bg-blue-600 hover:bg-blue-700 rounded-md transition"
      >
        {isAsideVisible ? <HiOutlineX size={20} /> : <FaBars size={20} />}
      </button>

      {}
      <ul
        className={`fixed top-14 left-4 w-44 bg-gray-800 rounded-lg shadow-lg p-4 text-white transition-all duration-300 ease-in-out z-50
        ${isAsideVisible ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}`}
      >
        <li>
          <button
            onClick={() => {
              onProfileClick();
              navigate("/perfil_estudiantes");
            }}
            className="w-full text-left py-2 hover:text-blue-400"
          >
            Estudiantes
          </button>
        </li>
        <li>
          <button
            onClick={onTesisClick}
            className="w-full text-left py-2 hover:text-blue-400"
          >
            Tesis
          </button>
        </li>
        <li>
          <button
            onClick={onAjustesClick}
            className="w-full text-left py-2 hover:text-blue-400"
          >
            Ajustes
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Aside;