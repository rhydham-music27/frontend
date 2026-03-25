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

  useEffect(() => {
    // Persistent logging that survives reloads
    const debugInfo = {
      isAuthenticated,
      loading,
      user: user ? { id: user.id, role: user.role, name: user.name } : null,
      studentRoute,
      token: localStorage.getItem('token'),
      storedUser: localStorage.getItem('user')
    };
    
    // Store in sessionStorage to survive reloads
    sessionStorage.setItem('authDebug', JSON.stringify(debugInfo));
    
    // Also log to console
    console.log('ProtectedRoute Debug:', debugInfo);
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to:', studentRoute ? "/student-login" : "/login");
    }
  }, [isAuthenticated, loading, user, studentRoute]);

  if (loading) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: 'rgba(255,255,255,0.9)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 9999,
        fontSize: '18px'
      }}>
        <div>
          <LoadingSpinner fullScreen />
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            Loading auth state...<br/>
            <small>Token: {localStorage.getItem('token') ? 'EXISTS' : 'MISSING'}</small><br/>
            <small>User: {localStorage.getItem('user') ? 'EXISTS' : 'MISSING'}</small>
          </div>
        </div>
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
