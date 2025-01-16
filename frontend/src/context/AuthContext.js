import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

const publicRoutes = ['/', '/nearby', '/login', '/register', '/add-strain'];

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper function to clear auth state and cookies
    const clearAuthState = () => {
        setAuth(null);
        // Clear cookies with all necessary attributes
        document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=.weedhurry.com; Secure; SameSite=None';
        document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=.weedhurry.com; Secure; SameSite=None';
    };

    // Function to log in the user
    const login = async (vendorId) => {
        setAuth({ vendorId });
    };

    // Function to log out the user
    const logout = async () => {
        try {
            console.log('Starting logout process...');
            await api.post('/auth/logout');
            console.log('Logout API call successful');
            
            clearAuthState();
            console.log('Auth state and cookies cleared');
            
            return true;
        } catch (error) {
            console.error('Logout failed:', error);
            clearAuthState();
            throw error;
        }
    };

    // Function to check authentication status
    const checkAuthStatus = async () => {
        // Skip auth check for public routes
        if (publicRoutes.includes(window.location.pathname)) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/validate', {
                withCredentials: true
            });

            if (response.data?.success) {
                setAuth({ vendorId: response.data.vendorId });
            } else {
                try {
                    await api.post('/auth/refresh-token');
                    const validationResponse = await api.get('/auth/validate');
                    if (validationResponse.data?.success) {
                        setAuth({ vendorId: validationResponse.data.vendorId });
                    } else {
                        clearAuthState();
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    clearAuthState();
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            clearAuthState();
        } finally {
            setLoading(false);
        }
    };

    // Check auth status on mount and route change
    useEffect(() => {
        const handleRouteChange = () => {
            checkAuthStatus();
        };

        // Initial check
        checkAuthStatus();

        // Listen for route changes
        window.addEventListener('popstate', handleRouteChange);

        return () => {
            window.removeEventListener('popstate', handleRouteChange);
        };
    }, []);

    const contextValue = {
        auth,
        login,
        logout,
        loading,
        checkAuthStatus
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {loading ? <div>Loading...</div> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};