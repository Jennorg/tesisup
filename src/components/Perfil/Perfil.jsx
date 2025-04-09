import { React, useState } from 'react'
import Header from '@/components/main/Layout/Header'
import ContentPerfil from '@/components/Perfil/ContentPerfil'

const Perfil = () => {
  const [isAsideVisible, setIsAsideVisible] = useState(false);

  return (
    <div>
      <Header isAsideVisible={isAsideVisible} onToggleMenu={setIsAsideVisible} />
      <ContentPerfil isAsideVisible={isAsideVisible} />
    </div>
  )
}

export default Perfil