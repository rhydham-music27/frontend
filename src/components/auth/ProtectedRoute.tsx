import React, { ReactNode, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthLoading, selectCurrentUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import LoadingSpinner from '../common/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  studentRoute?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, studentRoute = false }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const user = useSelector(selectCurrentUser);

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
    // Show debug info before redirect
    return (
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: 'rgba(255,0,0,0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 9999,
        fontSize: '16px'
      }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '400px' }}>
          <h3>Authentication Debug</h3>
          <p><strong>Not Authenticated!</strong></p>
          <p>Redirecting to: {studentRoute ? "/student-login" : "/login"}</p>
          <div style={{ fontSize: '12px', marginTop: '10px' }}>
            <div>Token: {localStorage.getItem('token') ? 'EXISTS' : 'MISSING'}</div>
            <div>User: {localStorage.getItem('user') ? 'EXISTS' : 'MISSING'}</div>
            <div>isAuthenticated: {isAuthenticated.toString()}</div>
            <div>loading: {loading.toString()}</div>
          </div>
        </div>
      </div>
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    console.log('User role not allowed, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
