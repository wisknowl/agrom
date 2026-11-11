import axios from 'axios';
import { getBaseApiUrl } from '@/utils/media';

export const apiClient = axios.create({
  baseURL: getBaseApiUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error attaching auth token', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;

