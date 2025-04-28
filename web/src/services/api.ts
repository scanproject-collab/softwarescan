import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});


api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("userToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);


api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.log("Erro 401 detectado, redirecionando para /login...");
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
);

export default api;