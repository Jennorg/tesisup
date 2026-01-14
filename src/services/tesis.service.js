import api from "./api";

const tesisService = {
  getAll: async (params = {}) => {
    const response = await api.get("/tesis", { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tesis/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post("/tesis", data);
    return response.data;
  },

  update: async (id, data) => {
    // Determine if we are upgrading status (requires PATCH) or full update (PUT)
    // Based on original code usage, but let's assume PUT for standard update.
    // However, status changes are often specific.
    // The original code in MainPage uses handleStatusChange locally but doesn't show the API call.
    // TesisForm uses PUT or POST.
    const response = await api.put(`/tesis/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tesis/${id}`);
    return response.data;
  },

  // Download logic
  downloadFile: async (path, onProgress) => {
    const response = await api.get(path, {
      responseType: "blob",
      timeout: 300000,
      onDownloadProgress: onProgress,
    });
    return {
      data: response.data,
      headers: response.headers,
    };
  },

  initiateDownloadAll: async () => {
    const response = await api.get("/tesis/download/all");
    return response.data;
  },
};

export default tesisService;
