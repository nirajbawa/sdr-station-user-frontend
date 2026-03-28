import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const storage = localStorage.getItem("sdr-auth-storage");
    if (storage) {
      try {
        const { state } = JSON.parse(storage);
        if (state.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (e) {
        console.error("Error parsing auth storage", e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth state
      const { logout } = useAuthStore.getState();
      logout();
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Add search methods
export const searchRecords = async (data: any, serverUrl?: string) => {
  const baseUrl = serverUrl ? `https://${serverUrl}` : "http://localhost:3005";
  const response = await api.post(`${baseUrl}/search/filter`, data);
  return response.data;
};

export const promptSearch = async (
  data: { prompt: string; limit?: number; page?: number },
  serverUrl?: string,
) => {
  const baseUrl = serverUrl ? `https://${serverUrl}` : "http://localhost:3005";
  const response = await api.post(`${baseUrl}/search/prompt`, data);
  return response.data;
};

export const getRecordById = async (id: string, serverUrl?: string) => {
  const baseUrl = serverUrl ? `https://${serverUrl}` : "http://localhost:3005";
  const response = await api.post(`${baseUrl}/records/${id}`);
  return response.data;
};

// Placeholder for export (usually would be a POST or GET returning a blob)
export const exportRecords = async (params: any, serverUrl?: string) => {
  const baseUrl = serverUrl ? `https://${serverUrl}` : "http://localhost:3005";
  const response = await api.get(`${baseUrl}/search/export`, {
    params,
    responseType: "blob",
  });
  return response.data;
};

export default api;
