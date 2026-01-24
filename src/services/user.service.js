import api from "./api";

/**
 * Servicio de Usuarios.
 * Maneja la obtención y actualización de datos de profesores, alumnos y encargados.
 */
const userService = {
  /**
   * Obtiene la lista de todos los profesores.
   */
  getProfesores: async () => {
    const response = await api.get("/profesor");
    return response.data;
  },

  /**
   * Obtiene la lista de todos los encargados.
   */
  getEncargados: async () => {
    const response = await api.get("/encargado");
    return response.data;
  },

  /**
   * Obtiene la lista de todos los estudiantes.
   */
  getEstudiantes: async () => {
    const response = await api.get("/estudiantes");
    return response.data;
  },

  /**
   * Obtiene la lista de todas las sedes.
   */
  getSedes: async () => {
    const response = await api.get("/sede");
    return response.data;
  },

  /**
   * Obtiene una sede específica por su ID.
   * @param {number|string} id - ID de la sede.
   */
  getSedeById: async (id) => {
    const response = await api.get(`/sede/search/${id}`);
    return response.data;
  },

  /**
   * Obtiene un usuario específico por su Cédula de Identidad (CI) y tipo.
   * @param {string} userType - Tipo de usuario (estudiante, profesor, encargado).
   * @param {string|number} ci - Cédula de identidad.
   */
  getByCi: async (userType, ci) => {
    const type = userType.toLowerCase();

    // Manejo especial para estudiantes si el endpoint individual no está estandarizado igual
    if (type === "estudiante") {
      const response = await api.get("/estudiantes");
      const estudiantes = response.data.data || response.data || [];
      const student = estudiantes.find((e) => String(e.ci) === String(ci));
      if (!student) throw new Error("Estudiante no encontrado");
      return student;
    }

    const endpointMap = {
      profesor: `/profesor/${ci}`,
      encargado: `/encargado/${ci}`,
    };

    const endpoint = endpointMap[type];
    if (!endpoint) throw new Error("Tipo de usuario no válido");

    const response = await api.get(endpoint);
    // Normalizar estructura de datos de respuesta
    return response.data.data || response.data;
  },

  /**
   * Actualiza la información de un usuario.
   * @param {string} userType - Tipo de usuario.
   * @param {string|number} ci - Cédula del usuario a actualizar.
   * @param {Object} data - Datos a actualizar.
   */
  update: async (userType, ci, data) => {
    const type = userType.toLowerCase();
    const endpointMap = {
      profesor: `/profesor/${ci}`,
      estudiante: `/estudiantes/${ci}`,
      encargado: `/encargado/${ci}`,
    };

    const endpoint = endpointMap[type];
    if (!endpoint)
      throw new Error("Tipo de usuario no válido para actualización");

    const response = await api.put(endpoint, data);
    return response.data;
  },
};

export default userService;
