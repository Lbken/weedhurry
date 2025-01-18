import axios from 'axios';

// Environment-based configuration
const ENV = {
    development: 'http://localhost:5001',
    production: 'https://api.weedhurry.com'
};

// Get current environment
const isDevelopment = process.env.NODE_ENV === 'development';
const baseURL = isDevelopment ? ENV.development : ENV.production;

const api = axios.create({
    baseURL,
    withCredentials: true, // This is crucial for sending cookies
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    // Add retry logic for failed requests
    retry: 3,
    retryDelay: (retryCount) => {
        return retryCount * 1000;
    }
});

// Interceptor to handle 401 errors and refresh tokens
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't retry if it's a logout request or already retried
        if (originalRequest.url === '/auth/logout' || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            originalRequest._retry = true;
            try {
                // Use environment-based URL for refresh token
                const refreshURL = `${baseURL}/api/auth/refresh-token`;
                const refreshResponse = await axios.post(
                    refreshURL,
                    {},
                    { withCredentials: true }
                );

                if (refreshResponse.data?.success) {
                    return api(originalRequest);
                } else {
                    handleAuthFailure();
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                handleAuthFailure();
                return Promise.reject(refreshError);
            }
        }

        // Handle other common errors
        if (error.response?.status === 503) {
            console.error('Service temporarily unavailable');
        }

        return Promise.reject(error);
    }
);

// Enhanced helper function to handle authentication failures
const handleAuthFailure = () => {
    const publicRoutes = ['/', '/nearby', '/login', '/register'];
    
    // Get the domain dynamically
    const domain = isDevelopment ? 'localhost' : '.weedhurry.com';
    
    // Clear cookies with environment-aware domain
    const cookieOptions = `Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; ${
        !isDevelopment ? `Domain=${domain};` : ''
    } ${!isDevelopment ? 'Secure; SameSite=None' : ''}`;
    
    document.cookie = `accessToken=; ${cookieOptions}`;
    document.cookie = `refreshToken=; ${cookieOptions}`;
    
    // Clear any local storage
    localStorage.removeItem('auth');
    sessionStorage.removeItem('auth'); // Also clear session storage

    // Only redirect to login if not on a public route
    if (!publicRoutes.includes(window.location.pathname)) {
        window.location.href = '/login';
    }
};

// Add request interceptor for common headers
api.interceptors.request.use(
    (config) => {
        // Add timestamp to prevent caching
        config.params = {
            ...config.params,
            _t: Date.now()
        };
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;