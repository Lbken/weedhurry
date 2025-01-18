import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api'; // Update this import path

export const AuthContext = createContext();

const publicRoutes = ['/', '/nearby', '/login', '/register', '/add-strain'];

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState(null);
    const [loading, setLoading] = useState(true);

    // Updated to match api.js cookie handling
    const clearAuthState = () => {
        setAuth(null);
        const isDevelopment = process.env.NODE_ENV === 'development';
        const domain = isDevelopment ? 'localhost' : '.weedhurry.com';
        
        // Use same cookie options as api.js
        const cookieOptions = `Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; ${
            !isDevelopment ? `Domain=${domain};` : ''
        } ${!isDevelopment ? 'Secure; SameSite=None' : ''}`;
        
        document.cookie = `accessToken=; ${cookieOptions}`;
        document.cookie = `refreshToken=; ${cookieOptions}`;
    };

    const login = async (vendorId) => {
        setAuth({ vendorId });
    };

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

    const checkAuthStatus = async () => {
        if (publicRoutes.includes(window.location.pathname)) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/validate');
            // No need to specify withCredentials as it's set in api.js

            if (response.data?.success) {
                setAuth({ vendorId: response.data.vendorId });
            } else {
                // Let the api.js interceptor handle token refresh
                clearAuthState();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            clearAuthState();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleRouteChange = () => {
            if (!publicRoutes.includes(window.location.pathname)) {
                checkAuthStatus();
            }
        };

        checkAuthStatus();
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
            {loading && !publicRoutes.includes(window.location.pathname) ? 
                <div>Loading...</div> : children}
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