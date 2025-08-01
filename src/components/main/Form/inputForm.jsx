import React from 'react';

const InputForm = ({ label, nombre, className, onChange, value, type = "text", options = [] }) => {
  if (type === "select") {
    return (
      <div className={`${className}`}>
        <label htmlFor={nombre} className='block text-sm font-medium text-gray-700'>
          {label || nombre[0].toUpperCase() + nombre.slice(1)} {}
        </label>
        <select
          id={nombre}
          name={nombre}
          onChange={onChange}
          value={value}
          className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
          required
        >
          <option value="" disabled hidden> {}
            {`Seleccione un ${label || nombre.replace('id_', '')}`}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <label htmlFor={nombre} className='block text-sm font-medium text-gray-700'>
        {label || nombre[0].toUpperCase() + nombre.slice(1)} {}
      </label>
      <input
        type={type}
        id={nombre}
        name={nombre}
        onChange={onChange}
        value={value}
        className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
        required
      />
    </div>
  );
};

export default InputForm;