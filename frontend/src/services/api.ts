import axios, { AxiosError } from 'axios';

import { useAuthStore } from '../store/auth.store';
import type { ApiError } from '../types/api.types';

export const BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Agrega el token JWT en cada request desde el store (en memoria, nunca localStorage)
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejo global de errores HTTP
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;

    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    if (status === 403) {
      console.error('Sin permisos para realizar esta acción.');
    }

    if (status && status >= 500) {
      console.error('Error interno del servidor. Intenta de nuevo más tarde.');
    }

    // Re-lanza el error tipado para que cada service lo maneje si necesita
    return Promise.reject(error);
  },
);

export default api;
