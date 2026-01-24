import api from "./api";

/**
 * Servicio de Autenticación.
 * Maneja inicio de sesión y registro de usuarios.
 */
const authService = {
  /**
   * Inicia sesión con credenciales.
   * @param {Object} credentials - { email, password } (o ci/password).
   * @returns {Promise<Object>} Datos de respuesta (token, usuario).
   */
  login: async (credentials) => {
    const response = await api.post("/login", credentials);
    return response.data;
  },

  /**
   * Registra un nuevo usuario según su tipo.
   * @param {string} type - Tipo de usuario: 'Encargado', 'Profesor', 'Estudiante'.
   * @param {Object} data - Datos del usuario a registrar.
   * @returns {Promise<Object>} Respuesta del servidor.
   */
  register: async (type, data) => {
    const endpoints = {
      Encargado: "encargado",
      Profesor: "profesor",
      Estudiante: "estudiantes",
      encargado: "encargado",
      profesor: "profesor",
      estudiante: "estudiantes",
    };

    const endpoint = endpoints[type];
    if (!endpoint) {
      throw new Error("Tipo de usuario no válido");
    }

    const response = await api.post(`/${endpoint}`, data);
    return response.data;
  },
};

export default authService;
