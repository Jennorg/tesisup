import { React } from 'react'

const ContentPerfil = ({ isAsideVisible }) => {
  const marginLeftClass = isAsideVisible ? 'ml-16' : 'ml-0';

  return (
    <div className={`flex-grow w-full p-4 overflow-ellipsis transition-margin-left duration-300 ease-in-out ${marginLeftClass}`}>
      <h1>Nombre</h1>
      <h2>Cargo</h2>
      <h3>Correo</h3>
      <h4>Telefono</h4>
      <h5>Direccion</h5>
    </div>
  )
}

export default ContentPerfil