import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (isLoggingOut) return;
        
        setIsLoggingOut(true);
        try {
            await logout();
            navigate('/login', { replace: true }); // Use replace to prevent back navigation
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <button 
            onClick={handleLogout} 
            disabled={isLoggingOut}
            className="btn btn-outline-secondary btn-sm rounded-pill"
        >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
    );
};

export default LogoutButton;