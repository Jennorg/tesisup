import api from "./api";

const authService = {
  login: async (credentials) => {
    const response = await api.post("/login", credentials);
    return response.data;
  },

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
