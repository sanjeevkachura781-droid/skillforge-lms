import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
export const tokenKey = 'skillforge.accessToken';

export const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenKey);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data;
    const details = body?.error?.details?.fieldErrors;
    const messages = details ? Object.values(details).flat().filter(Boolean).join(' ') : '';
    return messages || body?.message || 'The request could not be completed.';
  }
  return 'The request could not be completed.';
}
