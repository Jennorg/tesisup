/**
 * Helper para manejar cambios en inputs de formularios.
 * Actualiza el estado del formulario basándose en el atributo 'name' del input.
 *
 * @param {Event} e - Evento del cambio (onChange).
 * @param {Function} setFormData - Función setter del estado del formulario (useState).
 */
const handleInputChange = (e, setFormData) => {
  const { name, value } = e.target;
  setFormData((prevState) => ({
    ...prevState,
    [name]: value,
  }));
};

export default handleInputChange;
