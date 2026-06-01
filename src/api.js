import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_V1_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject the JWT auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 401 Unauthorized means token expired or invalid
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // We can force a page reload to let the router handle it
        if (!window.location.pathname.endsWith('/login') && !window.location.pathname.endsWith('/register')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error.response.data || { message: 'Server error occurred' });
    }
    return Promise.reject({ message: 'Network connection failed' });
  }
);

export default api;
