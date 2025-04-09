import React, { useState } from 'react';
import axios from 'axios';
import InputForm from '@/components/main/Form/inputForm';

const TesisForm = React.forwardRef((props, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    autor: '',
    id_tutor: '',
    id_encargado: '',
    fecha: '',
    id_sede: '',
    estado: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      archivo_pdf: e.target.files[0]
    })
  }

  const sendForm = async () => {
    setIsLoading(true);
    console.log(formData);
    try {
      const res = await axios.post('http://localhost:8080/api/tesis', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Indispensable para enviar archivos
        },
      });
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false);
  };

  return (
    <form ref={ref} className='w-max h-max rounded-lg bg-secundary grid place-items-center py-3 px-5' onSubmit={sendForm}>
      <h1 className='text-xl font-bold text-black'>Formulario de Tesis</h1>
      <div className='grid grid-cols-2 gap-4'>
        <div className='col-span-2 flex flex-col items-center justify-center'>
          <label className='text-black'>Adjunte la tesis</label>
          <input type="file" name="archivo_pdf" className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black' required onChange={handleFileChange} />
        </div>
        <InputForm nombre="nombre" className="col-span-2" onChange={handleInputChange} value={formData.nombre} />
        <InputForm nombre="autor" onChange={handleInputChange} value={formData.autor} />
        <InputForm nombre="id_tutor" onChange={handleInputChange} value={formData.id_tutor} />
        <InputForm nombre="id_encargado" onChange={handleInputChange} value={formData.id_encargado} />
        <div className='col-span-2 flex flex-col items-center justify-center'>
          <label className='text-black'>Adjunte la tesis</label>
          <input type="date" name="fecha" className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black' required onChange={handleInputChange} />
        </div>
        {/* <InputForm nombre="fecha" onChange={handleInputChange} value={formData.fecha} /> */}
        <InputForm nombre="id_sede" onChange={handleInputChange} value={formData.id_sede} />
        <InputForm nombre="estado" onChange={handleInputChange} value={formData.estado} />
        <button type="submit" className='w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600'>Enviar</button>
      </div>
    </form>
  );
});

export default TesisForm;