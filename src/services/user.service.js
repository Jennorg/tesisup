import api from "./api";

const userService = {
  getProfesores: async () => {
    const response = await api.get("/profesor");
    return response.data;
  },

  getEncargados: async () => {
    const response = await api.get("/encargado");
    return response.data;
  },

  getEstudiantes: async () => {
    const response = await api.get("/estudiantes");
    return response.data;
  },

  getSedes: async () => {
    const response = await api.get("/sede");
    return response.data;
  },

  getSedeById: async (id) => {
    const response = await api.get(`/sede/search/${id}`);
    return response.data;
  },

  getByCi: async (userType, ci) => {
    const type = userType.toLowerCase();

    if (type === "estudiante") {
      // Special handling for estudiante if simple get by id is not supported as per original code
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
    // Normalize response data structure
    return response.data.data || response.data;
  },

  update: async (userType, ci, data) => {
    const type = userType.toLowerCase();
    const endpointMap = {
      profesor: `/profesor/${ci}`,
      estudiante: `/estudiantes/${ci}`, // Note 'estudiantes' plural
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
