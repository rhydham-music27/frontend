import React, { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthLoading, selectCurrentUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import LoadingSpinner from '../common/LoadingSpinner';
import { USER_ROLES, VERIFICATION_STATUS } from '../../constants';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  studentRoute?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, studentRoute = false }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();


  if (loading) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: '#FFFFFF', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 9999,
      }}>
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={studentRoute ? "/student-login" : "/login"} state={{ from: location }} replace />;
  }

  if (user?.role === USER_ROLES.MANAGER && user?.verificationStatus !== VERIFICATION_STATUS.VERIFIED) {
    if (location.pathname !== '/manager-verification') {
      return <Navigate to="/manager-verification" replace />;
    }
  }

  if (user?.role === USER_ROLES.COORDINATOR && user?.verificationStatus === VERIFICATION_STATUS.PENDING) {
    if (!location.pathname.includes('coordinator-verification')) {
      return <Navigate to="/coordinator-verification" replace />;
    }
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log('User role not allowed, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

