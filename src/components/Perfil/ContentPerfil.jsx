import { React } from 'react'

const ContentPerfil = ({ isAsideVisible, user }) => {
  const marginLeftClass = isAsideVisible ? 'ml-16' : 'ml-0';

  return (
    <div className={`flex-grow w-full p-4 overflow-ellipsis transition-margin-left duration-300 ease-in-out ${marginLeftClass}`}>
      <h1>{user?.nombre || "Nombre no disponible"}</h1>
      <h2>{user?.cargo || "Cargo no disponible"}</h2>
      <h3>{user?.email || "Correo no disponible"}</h3>
      <h4>{user?.telefono || "Teléfono no disponible"}</h4>
      <h5>{user?.direccion || "Dirección no disponible"}</h5>
    </div>
  );
};

export default ContentPerfil;