import React, { useEffect, useState } from "react";
import axios from 'axios'
import { GoSearch } from "react-icons/go";
import handleInputChange from "@/hooks/utils/handleInputChange";

const SearchBar = () => {
    const [tesisABuscar, setTesisABuscar] = useState("")

    const handleInput = (e) => {
        handleInputChange(e, setTesisABuscar)
    }

    // useEffect(() => {
    //     axios.get('http://localhost:8080/api/tesis', {
    //         params: {
    //             nombre: tesisABuscar
    //         }
    //     })
    //         .then(res => console.log(res.data))
    //         .catch(err => console.log(err))
    // })

    return (
        <div className="flex max-h-8 place-items-center border-primary border-2 rounded-lg p-1 w-11/12 relative">
            <input type="text"
                className="text-primary" placeholder="Buscar tesis" onChange={handleInput} />
            <GoSearch className="absolute right-1.5 text-primary" />
        </div>
    )
}

export default SearchBar;