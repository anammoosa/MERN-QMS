import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export const PublicRoute = () => {
    const { user } = useAuth();
    if (user) {
        if (user.role === 'Admin') return <Navigate to="/admin" replace />;
        if (user.role === 'Instructor') return <Navigate to="/teacher" replace />;
        return <Navigate to="/student" replace />;
    }
    return <Outlet />;
};
