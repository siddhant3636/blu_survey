import axios from "axios";

let apiBaseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

if (
  typeof window !== "undefined" &&
  window.location &&
  !window.location.hostname.includes("localhost") &&
  !window.location.hostname.includes("127.0.0.1") &&
  apiBaseURL.includes("localhost")
) {
  apiBaseURL = window.location.origin + "/api/v1";
}

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 30000,
});

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
  }
);

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    // Handle global errors e.g. token expired, unauthorized redirect
    if (error.response?.status === 401) {
      // Clear token and redirect to login if not already there
      localStorage.removeItem("token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
