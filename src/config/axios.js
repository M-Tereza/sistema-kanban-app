import axios from "axios";

export const API_URLS = "http://localhost:8082/api/v1";

const api = axios.create({
  baseURL: API_URLS,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("login");
      localStorage.removeItem("role");

      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;