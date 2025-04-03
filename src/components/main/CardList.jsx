import { React, useState, useEffect } from "react"
import axios from 'axios'
import Card from "@/components/main/Card"

const CardList = () => {
    const [tesis, setTesis] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchTesis = async () => {
        setIsLoading(true)
        axios.get('http://localhost:8080/api/tesis')
            .then(res => {
                setTesis(res.data)
                console.log(res.data)
                setIsLoading(false)
            })
            .catch(err => {
                setError(err)
                setIsLoading(false)
            })
    }

    useEffect(() => {
        fetchTesis()
    }, [])

    return (
        <ul className="flex flex-col w-full gap-3">
            {tesis.map((data, index) => (
                <li key={index} className="w-full">
                    <Card data={data} />
                </li>
            ))}
        </ul>
    )
}

export default CardList;