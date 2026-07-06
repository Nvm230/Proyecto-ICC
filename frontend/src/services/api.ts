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
export const createUser = (data: any) => api.post('/auth/register', data).then(res => res.data);
export const changePassword = (data: any) => api.put('/auth/change-password', data).then(res => res.data);
export const adminChangePassword = (id: number, data: any) => api.put(`/auth/admin/users/${id}/password`, data).then(res => res.data);
export const adminChangeRole = (id: number, data: any) => api.put(`/auth/admin/users/${id}/role`, data).then(res => res.data);
export const adminDeleteUser = (id: number) => api.delete(`/auth/admin/users/${id}`).then(res => res.data);

export const getUserViolations = (username: string) => api.get(`/monitor/violations/user/${username}`).then(res => res.data);
export const createViolation = (data: any) => api.post('/monitor/violations', data).then(res => res.data);
export const resolveViolation = (id: number) => api.patch(`/monitor/violations/${id}/resolve`).then(res => res.data);
export const falsePositiveViolation = (id: number) => api.patch(`/monitor/violations/${id}/false-positive`).then(res => res.data);
export const fineViolation = (id: number, data: any) => api.patch(`/monitor/violations/${id}/fine`, data).then(res => res.data);
