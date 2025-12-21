import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // ✅ Silently ignore expected auth errors
    if (error.response?.status === 401) {
      return Promise.reject(error);
    }

    console.error(
      "API Error:",
      error.response?.status,
      error.config?.url
    );
    return Promise.reject(error);
  }
);

export default api;
