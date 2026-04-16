import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRolesRaw = localStorage.getItem('userRoles');
    let userRoles = [];

    try {
        userRoles = userRolesRaw ? JSON.parse(userRolesRaw) : [];
    } catch (e) {
        console.error("Error parsing userRoles", e);
    }

    // 1. Nếu chưa đăng nhập -> Về trang Login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2. Nếu có yêu cầu Role nhưng người dùng không có Role phù hợp
    if (allowedRoles && Array.isArray(allowedRoles)) {
        const hasPermission = allowedRoles.some(role => userRoles.includes(role));
        
        if (!hasPermission) {
            // Không có quyền -> Chuyển hướng về trang phù hợp với Role hiện tại
            if (userRoles.includes('Admin')) return <Navigate to="/admin" replace />;
            if (userRoles.includes('Driver')) return <Navigate to="/driver" replace />;
            return <Navigate to="/home" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
