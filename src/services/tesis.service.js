import api from "./api";

/**
 * Servicio para gestionar las operaciones relacionadas con las tesis.
 * Se comunica con el backend para realizar CRUD y descargas.
 */
const tesisService = {
  /**
   * Obtiene una lista de tesis filtrada y paginada.
   * @param {Object} params - Parámetros de consulta (page, limit, filtros).
   * @returns {Promise<Object>} Respuesta del servidor con las tesis y metadatos.
   */
  getAll: async (params = {}) => {
    const response = await api.get("/tesis", { params });
    return response.data;
  },

  /**
   * Obtiene los detalles de una tesis específica por su ID.
   * @param {string|number} id - Identificador de la tesis.
   * @returns {Promise<Object>} Datos de la tesis.
   */
  getById: async (id) => {
    const response = await api.get(`/tesis/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo registro de tesis.
   * @param {FormData} data - Datos del formulario, incluyendo archivos.
   * @returns {Promise<Object>} Respuesta del servidor tras la creación.
   */
  create: async (data) => {
    const response = await api.post("/tesis", data, {
      headers: {
        "Content-Type": undefined,
      },
    });
    return response.data;
  },

  /**
   * Actualiza una tesis existente.
   * @param {string|number} id - ID de la tesis a actualizar.
   * @param {FormData} data - Nuevos datos para la tesis.
   * @returns {Promise<Object>} Respuesta del servidor tras la actualización.
   */
  update: async (id, data) => {
    const response = await api.put(`/tesis/${id}`, data, {
      headers: {
        "Content-Type": undefined,
      },
    });
    return response.data;
  },

  /**
   * Elimina una tesis del sistema.
   * @param {string|number} id - ID de la tesis a eliminar.
   * @returns {Promise<Object>} Confirmación de eliminación.
   */
  delete: async (id) => {
    const response = await api.delete(`/tesis/${id}`);
    return response.data;
  },

  /**
   * Descarga un archivo asociado a una tesis.
   * @param {string} path - Ruta relativa de la API para descargar el archivo.
   * @param {Function} onProgress - Callback para reportar el progreso de carga.
   * @returns {Promise<Object>} Objeto con los datos binarios (blob) y cabeceras.
   */
  downloadFile: async (path, onProgress) => {
    const response = await api.get(path, {
      responseType: "blob",
      timeout: 300000, // 5 minutos de tiempo de espera
      onDownloadProgress: onProgress,
    });
    return {
      data: response.data,
      headers: response.headers,
    };
  },

  /**
   * Inicia el proceso de descarga masiva de todas las tesis.
   * @returns {Promise<Object>} Datos del trabajo iniciado (jobId).
   */
  initiateDownloadAll: async () => {
    const response = await api.get("/tesis/download/all");
    return response.data;
  },
};

export default tesisService;
