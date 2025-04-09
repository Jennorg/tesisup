import React from 'react'
import Aside from "@/components/main/Layout/Aside";
import SearchBar from "@/components/main/Search/SearchBar";
import LogoContainer from "@/components/main/Ui/LogoContainer"

const Header = ({ isAsideVisible, onToggleMenu }) => {
  return (
    <div className="flex place-items-center gap-3">
      <Aside
        isAsideVisible={isAsideVisible}
        onToggleMenu={onToggleMenu}
      />
      <SearchBar />
      <LogoContainer />
    </div>
  )
}

export default Header;