import axios from "axios";

/**
 * Instancia global de Axios configurada para la API.
 * Configura la URL base y credenciales.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor de solicitudes.
 * Inyecta el token de autorización (Bearer Token) en cada petición si existe en localStorage.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
