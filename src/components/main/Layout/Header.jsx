import React from 'react'
import Aside from "@/components/main/Layout/Aside";
import SearchBar from "@/components/main/Search/SearchBar";
import LogoContainer from "@/components/main/Ui/LogoContainer"

const Header = ({ isAsideVisible, onToggleMenu, setIsLoading }) => {
  return (
    <div className="flex place-items-center gap-3">
      <Aside
        isAsideVisible={isAsideVisible}
        onToggleMenu={onToggleMenu}
      />
      <SearchBar setIsLoading={setIsLoading} />
      <LogoContainer />
    </div>
  )
}

export default Header;