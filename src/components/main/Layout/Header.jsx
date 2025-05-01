import React from 'react'
import Aside from "@/components/main/Layout/Aside";
import SearchBar from "@/components/main/Search/SearchBar";
import LogoContainer from "@/components/main/Ui/LogoContainer"

const Header = ({ isAsideVisible, onToggleMenu, setIsLoading, tesisEncontradas, setTesisEncontradas, setHaBuscado }) => {
  return (
    <div className="flex place-items-center gap-3">
      <Aside
        isAsideVisible={isAsideVisible}
        onToggleMenu={onToggleMenu}
      />
      <SearchBar
        setIsLoading={setIsLoading}
        setTesisEncontradas={setTesisEncontradas}
        tesisEncontradas={tesisEncontradas}
        setHaBuscado={setHaBuscado}
      />
      <LogoContainer />
    </div>
  )
}

export default Header;