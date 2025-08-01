import { useState } from "react";
import Header from "@/components/main/Layout/Header";
import Aside from "@/components/main/Layout/Aside";
import ContentPerfil from "@/components/Perfil/ContentPerfil";

const Perfil = () => {
  const [isAsideVisible, setIsAsideVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  const handleProfileClick = () => {
    setActiveSection("perfil"); 
    setIsAsideVisible(true);
  };

  const handleToggleMenu = () => {
    setIsAsideVisible((prev) => !prev);
    if (!isAsideVisible) setActiveSection(null); 
  };

  return (
    <div className="flex">
      <Header isAsideVisible={isAsideVisible} onToggleMenu={handleToggleMenu} onProfileClick={handleProfileClick} />
      <Aside onProfileClick={handleProfileClick} />

      {}
      {!activeSection && (
        <div className="mt-4">
          <p className="text-red-500">Error al cargar las tesis: Network Error</p>
        </div>
      )}

      {}
      {activeSection === "perfil" && <ContentPerfil />}
    </div>
  );
};

export default Perfil;