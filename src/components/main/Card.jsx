import React from "react"
import formatDate from "@/hooks/utils/formatDate"

const Card = ({ data }) => {
    return (
        <div className="grid grid-cols-12 border-2 border-primary rounded-lg p-2 w-full gap-3 place-content-center">
            <h2 className="col-span-12">{data.nombre}</h2>
            <p className="col-span-4 text-xs">Encargado: {data.id_encargado}</p>
            <p className="col-span-4 text-xs">Fecha: {formatDate(data.fecha)}</p>
            <p className="col-span-4 text-xs">Estado: {data.estado}</p>
        </div>
    )
}

export default Card