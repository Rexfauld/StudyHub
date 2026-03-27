import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://studyhub-backend-1049463981239.us-central1.run.app/api',
  withCredentials: true,
});

// Attach JWT token to every request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;