import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api.weedhurry.com',
    withCredentials: true,
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
                // Attempt to refresh the token
                const refreshResponse = await axios.post(
                    'https://api.weedhurry.com/api/auth/refresh-token',
                    {},
                    {
                        withCredentials: true // Use cookies instead of headers
                    }
                );

                // If refresh successful, retry the original request
                if (refreshResponse.data?.success) {
                    return api(originalRequest);
                } else {
                    // If refresh failed, clear auth and redirect
                    handleAuthFailure();
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                handleAuthFailure();
            }
        }

        return Promise.reject(error);
    }
);

// Helper function to handle authentication failures
const handleAuthFailure = () => {
    const publicRoutes = ['/', '/nearby', '/login', '/register'];
    
    // Clear cookies
    document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=.weedhurry.com; Secure; SameSite=None';
    document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=.weedhurry.com; Secure; SameSite=None';
    
    // Clear any local storage
    localStorage.removeItem('auth');

    // Only redirect to login if not on a public route
    if (!publicRoutes.includes(window.location.pathname)) {
        window.location.href = '/login';
    }
};

export default api;