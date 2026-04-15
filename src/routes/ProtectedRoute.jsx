import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRolesRaw = localStorage.getItem('userRoles');
    const userRoles = userRolesRaw ? JSON.parse(userRolesRaw) : [];

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.some(role => userRoles.includes(role))) {
        // Redirect to home or a forbidden page if user doesn't have required role
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default ProtectedRoute;
