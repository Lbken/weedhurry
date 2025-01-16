import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { auth, loading } = useAuth();

    if (loading) return <div>Loading...</div>; // Show loading spinner while checking auth
    if (!auth) return <Navigate to="/login" />; // Redirect to login if not authenticated

    return children;
};

export default ProtectedRoute;
