import React from 'react'

const InputForm = ({ nombre, className, onChange, value }) => {
  return (
    <div className={`${className}`}>
      <label htmlFor={nombre}
        className='block text-sm font-medium text-gray-700'>
        {nombre[0].toUpperCase() + nombre.slice(1)}
      </label>
      <input
        type="text"
        id={nombre}
        name={nombre}
        onChange={onChange}
        value={value}
        className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
        required />
    </div>
  )
}

export default InputForm