import React from "react";
import { Link } from "react-router-dom";

/**
 * Componente LogoContainer
 * Renderiza el logo de la aplicación envuelto en un enlace a la página principal.
 * Se adapta al tamaño de pantalla mediante clases responsivas de Tailwind.
 */
const LogoContainer = () => {
  return (
    <Link to="/MainPage" className="flex items-center">
      <img
        className="h-20 md:h-14 w-auto object-contain"
        src="/img/uneg-logo.png"
        alt="UNEG Logo"
      />
    </Link>
  );
};

export default LogoContainer;
