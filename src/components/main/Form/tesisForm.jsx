import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InputForm from '@/components/main/Form/inputForm';

const TesisForm = React.forwardRef((props, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_tesis: '', // NUEVO CAMPO
    nombre: '',
    id_estudiante: '',
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
    estudiantes: [],
  });

  const estados = [
    "Aprobada",
    "Rechazada",
    "Pendiente",
  ];

  useEffect(() => {
    const loadFormOptions = async () => {
      try {
        const [profesoresRes, encargadosRes, sedesRes, estudiantesRes] = await Promise.all([
          axios.get('http://localhost:8080/api/profesor'),
          axios.get('http://localhost:8080/api/encargado'),
          axios.get('http://localhost:8080/api/sede'),
          axios.get('http://localhost:8080/api/estudiantes')
        ]);

        setDropdownOptions({
          profesores: Array.isArray(profesoresRes.data.data) ? profesoresRes.data.data : [],
          encargados: Array.isArray(encargadosRes.data.data) ? encargadosRes.data.data : [],
          sedes: Array.isArray(sedesRes.data.data) ? sedesRes.data.data : [],
          estudiantes: Array.isArray(estudiantesRes.data.data) ? estudiantesRes.data.data : [],
        });

      } catch (error) {
        console.error('Error al cargar opciones:', error);
        setDropdownOptions({
          profesores: [],
          encargados: [],
          sedes: [],
          estudiantes: [],
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

    if (!formData.id_tesis) {
      alert("Debes ingresar un ID para la tesis.");
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }

      const res = await axios.post('http://localhost:8080/api/tesis', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(res.data);
      // Puedes mostrar mensaje de éxito o limpiar form si quieres

    } catch (err) {
      console.log(err);
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

        <InputForm
          label="ID Tesis"
          nombre="id_tesis"
          onChange={handleInputChange}
          value={formData.id_tesis}
          type="text"
          placeholder="Ej: 101"
        />

        <InputForm
          label="Autor"
          nombre="id_estudiante"
          onChange={handleInputChange}
          value={formData.id_estudiante}
          type="select"
          options={dropdownOptions.estudiantes?.map((estudiante) => ({
            value: estudiante.ci,
            label: `${estudiante.nombre} ${estudiante.apellido}`,
          }))}
        />

        <InputForm
          label="Tutor"
          nombre="id_tutor"
          onChange={handleInputChange}
          value={formData.id_tutor}
          type="select"
          options={dropdownOptions.profesores?.map((profesor) => ({
            value: profesor.ci,
            label: `${profesor.nombre} ${profesor.apellido}`,
          }))}
        />

        <InputForm
          label="Encargado"
          nombre="id_encargado"
          onChange={handleInputChange}
          value={formData.id_encargado}
          type="select"
          options={dropdownOptions.encargados?.map((encargado) => ({
            value: encargado.ci,
            label: `${encargado.nombre} ${encargado.apellido}`,
          }))}
        />

        <div className='col-span-2 flex flex-col items-center justify-center'>
          <label className='text-black'>Fecha de publicación</label>
          <input type="date" name="fecha" className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black' required onChange={handleInputChange} />
        </div>

        <InputForm
          label="Sede"
          nombre="id_sede"
          onChange={handleInputChange}
          value={formData.id_sede}
          type="select"
          options={dropdownOptions.sedes?.map((sede) => ({
            value: sede.id,
            label: `${sede.nombre}`,
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
