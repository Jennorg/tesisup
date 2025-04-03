import React from "react";

import { GoSearch } from "react-icons/go";

const SearchBar = () => {
    return (
        <div className="flex max-h-8 place-items-center border-primary border-2 rounded-lg p-1 w-11/12 relative">
            <input type="text"
             className="text-primary" placeholder="Buscar tesis"/>            
            <GoSearch className="absolute right-1.5 text-primary"/>
        </div>
    )
}

export default SearchBar;