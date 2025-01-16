import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.weedhurry.com';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If you want to handle unauthorized errors globally
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;