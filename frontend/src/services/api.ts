import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const api = axios.create({
  baseURL: '/api', // Proxied by Nginx or Vite dev server
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getUsers = () => api.get('/auth/users').then(res => res.data);
export const getUserViolations = (username: string) => api.get(`/monitor/violations/user/${username}`).then(res => res.data);
export const createViolation = (data: any) => api.post('/monitor/violations', data).then(res => res.data);
export const resolveViolation = (id: number) => api.patch(`/monitor/violations/${id}/resolve`).then(res => res.data);
