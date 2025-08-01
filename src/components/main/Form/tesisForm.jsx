import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InputForm from '@/components/main/Form/inputForm';

const TesisForm = React.forwardRef((props, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_tesis: '',
    nombre: '',
    id_estudiante: '',
    id_tutor: '',
    id_encargado: '',
    fecha: '',
    id_sede: '',
    estado: '',
    archivo_pdf: null,
    modo_envio: 'normal', 
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    profesores: [],
    encargados: [],
    sedes: [],
    estudiantes: [],
  });

  const estados = ["Aprobada", "Rechazada", "Pendiente"];

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
          profesores: profesoresRes.data.data || [],
          encargados: encargadosRes.data.data || [],
          sedes: sedesRes.data.data || [],
          estudiantes: estudiantesRes.data.data || [],
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, archivo_pdf: e.target.files[0] }));
  };

const sendForm = async () => {
  setIsLoading(true);

  if (!formData.id_tesis) {
    alert("Debes ingresar un ID para la tesis.");
    setIsLoading(false);
    return;
  }

  const datos = new FormData();
  Object.keys(formData).forEach((key) => {
    
    if (key === "archivo_pdf") {
      datos.append("archivo", formData[key]);
    } else {
      datos.append(key, formData[key]);
    }
  });

  const endpoint =
    formData.modo_envio === 'digitalizar'
      ? 'http://localhost:8080/api/tesis/digital'
      : 'http://localhost:8080/api/tesis';

  try {
    const res = await axios.post(endpoint, datos, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    console.log(res.data);
  } catch (err) {
    console.error('Error al enviar:', err);
  }

  setIsLoading(false);
};

  return (
    <form ref={ref} className='w-max h-max rounded-lg bg-secundary grid place-items-center py-3 px-5'>
      <h1 className='text-xl font-bold text-black'>Formulario de Tesis</h1>

      <div className='grid grid-cols-2 gap-4'>

        {}
        <div className='col-span-2'>
          <label className='text-black'>¿Cómo desea subir la tesis?</label>
          <select
            name="modo_envio"
            value={formData.modo_envio}
            onChange={handleInputChange}
            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
          >
            <option value="normal">Subir archivo PDF</option>
            <option value="digitalizar">Escanear imagen y convertir a PDF</option>
          </select>
        </div>

        {}
        <div className='col-span-2'>
          <label className='text-black'>
            {formData.modo_envio === 'digitalizar'
              ? 'Adjunte imagen para escanear'
              : 'Adjunte archivo PDF'}
          </label>
          <input
            type="file"
            name="archivo_pdf"
            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
            required
            onChange={handleFileChange}
            accept={formData.modo_envio === 'digitalizar' ? 'image/*' : 'application/pdf'}
          />
        </div>

        {}
        <InputForm nombre="nombre" className="col-span-2" onChange={handleInputChange} value={formData.nombre} />
        <InputForm label="ID Tesis" nombre="id_tesis" onChange={handleInputChange} value={formData.id_tesis} />

        <InputForm
          label="Autor"
          nombre="id_estudiante"
          onChange={handleInputChange}
          value={formData.id_estudiante}
          type="select"
          options={dropdownOptions.estudiantes.map((e) => ({
            value: e.ci,
            label: `${e.nombre} ${e.apellido}`
          }))}
        />

        <InputForm
          label="Tutor"
          nombre="id_tutor"
          onChange={handleInputChange}
          value={formData.id_tutor}
          type="select"
          options={dropdownOptions.profesores.map((p) => ({
            value: p.ci,
            label: `${p.nombre} ${p.apellido}`
          }))}
        />

        <InputForm
          label="Encargado"
          nombre="id_encargado"
          onChange={handleInputChange}
          value={formData.id_encargado}
          type="select"
          options={dropdownOptions.encargados.map((c) => ({
            value: c.ci,
            label: `${c.nombre} ${c.apellido}`
          }))}
        />

        <div className='col-span-2 flex flex-col items-center justify-center'>
          <label className='text-black'>Fecha de publicación</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleInputChange}
            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black'
            required
          />
        </div>

        <InputForm
          label="Sede"
          nombre="id_sede"
          onChange={handleInputChange}
          value={formData.id_sede}
          type="select"
          options={dropdownOptions.sedes.map((sede) => ({
            value: sede.id,
            label: `${sede.nombre}`
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
            label: estado
          }))}
        />

        <button
          type="button"
          className='col-span-2 w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600'
          disabled={isLoading}
          onClick={sendForm}
        >
          {isLoading
            ? (formData.modo_envio === 'digitalizar' ? 'Digitalizando...' : 'Enviando...')
            : (formData.modo_envio === 'digitalizar' ? 'Digitalizar tesis' : 'Subir PDF')}
        </button>
      </div>
    </form>
  );
});

export default TesisForm;