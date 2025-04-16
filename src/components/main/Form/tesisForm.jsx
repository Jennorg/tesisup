import React, { useState, useEffect } from 'react';
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
    archivo_pdf: null,
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    profesores: [],
    encargados: [],
    sedes: [],
  });

  const estados = [
    "Aprobada",
    "Rechazada",
    "Pendiente",
  ]

  useEffect(() => {
    const loadFormOptions = async () => {
      try {
        const [profesoresRes, encargadosRes, sedesRes] = await Promise.all([
          axios.get('http://localhost:8080/api/profesor'),
          axios.get('http://localhost:8080/api/encargado'),
          axios.get('http://localhost:8080/api/sede')
        ]);

        setDropdownOptions({
          profesores: Array.isArray(profesoresRes.data.data) ? profesoresRes.data.data : [],
          encargados: Array.isArray(encargadosRes.data.data) ? encargadosRes.data.data : [],
          sedes: Array.isArray(sedesRes.data.data) ? sedesRes.data.data : [],
        });

      } catch (error) {
        console.error('Error al cargar opciones:', error);
        setDropdownOptions({
          profesores: [],
          encargados: [],
          sedes: [],
        });
      }
    };

    loadFormOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      archivo_pdf: e.target.files[0],
    });
  };

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
      // Aquí podrías agregar lógica para mostrar un mensaje de éxito o redirigir
    } catch (err) {
      console.log(err);
      // Aquí podrías agregar lógica para mostrar un mensaje de error
    }
    setIsLoading(false);
  };

  return (
    <form ref={ref} className='w-max h-max rounded-lg bg-secundary grid place-items-center py-3 px-5'>
      <h1 className='text-xl font-bold text-black'>Formulario de Tesis</h1>
      <div className='grid grid-cols-2 gap-4'>
        <div className='col-span-2 flex flex-col items-center justify-center'>
          <label className='text-black'>Adjunte la tesis</label>
          <input type="file" name="archivo_pdf" className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black' required onChange={handleFileChange} />
        </div>
        <InputForm nombre="nombre" className="col-span-2" onChange={handleInputChange} value={formData.nombre} />
        <InputForm nombre="autor" onChange={handleInputChange} value={formData.autor} />
        <InputForm
          label="tutor"
          nombre="id_tutor"
          onChange={handleInputChange}
          value={formData.id_tutor}
          type="select"
          options={dropdownOptions.profesores?.map((profesor) => ({
            value: profesor.ci, // Asegúrate de usar el identificador correcto
            label: `${profesor.nombre} ${profesor.apellido}`, // Asegúrate de usar el nombre del profesor
          }))}
        />
        <InputForm
          label="encargado"
          nombre="id_encargado"
          onChange={handleInputChange}
          value={formData.id_encargado}
          type="select"
          options={dropdownOptions.encargados?.map((encargado) => ({
            value: encargado.ci, // Asegúrate de usar el identificador correcto
            label: `${encargado.nombre} ${encargado.apellido}`, // Asegúrate de usar el nombre del encargado
          }))}
        />
        <div className='col-span-2 flex flex-col items-center justify-center'>
          <label className='text-black'>Fecha de publicación</label>
          <input type="date" name="fecha" className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black' required onChange={handleInputChange} />
        </div>
        <InputForm
          label="sede"
          nombre="id_sede"
          onChange={handleInputChange}
          value={formData.id_sede}
          type="select"
          options={dropdownOptions.sedes?.map((sede) => ({
            value: sede.id, // Asegúrate de usar el identificador correcto
            label: `${sede.nombre}`, // Asegúrate de usar el nombre del encargado
          }))}
        />
        <InputForm
          label="Estado de la Tesis"
          nombre="estado"
          onChange={handleInputChange}
          value={formData.estado}
          type="select"
          options={estados.map((estado) => ({
            value: estado,
            label: estado,
          }))}
        />
        <button type="button" className='w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600' disabled={isLoading} onClick={sendForm}>
          {isLoading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </form>
  );
});

export default TesisForm;