import axios from 'axios';

// Get backend URL from env or use default local
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Clear token and redirect is typically handled by auth context
      localStorage.removeItem('token');
    }
    // Normalize axios errors so callers can reliably read `status` + `message`
    if (error?.response) {
      return Promise.reject({
        status,
        ...error.response.data,
      });
    }
    return Promise.reject(error);
  }
);
