import React from 'react';
import { useNavigate } from "react-router-dom"; 
import Aside from "@/components/main/Layout/Aside";
import SearchBar from "@/components/main/Search/SearchBar";
import LogoContainer from "@/components/main/Ui/LogoContainer";

const Header = ({
  isAsideVisible,
  onToggleMenu,
  setIsLoading,
  tesisEncontradas,
  setTesisEncontradas,
  setHaBuscado
}) => {
  const navigate = useNavigate(); 

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/"); 
  };

  const handleProfileClick = () => {
    navigate("/perfil_estudiantes"); 
  };

  return (
    <div className="flex place-items-center gap-3 justify-between w-full">
      <div className="flex gap-3">
        <Aside
          isAsideVisible={isAsideVisible}
          onToggleMenu={onToggleMenu}
          onProfileClick={handleProfileClick}
        />
        <SearchBar
          setIsLoading={setIsLoading}
          setTesisEncontradas={setTesisEncontradas}
          tesisEncontradas={tesisEncontradas}
          setHaBuscado={setHaBuscado}
        />
        <LogoContainer />
      </div>

      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-semibold"
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default Header;