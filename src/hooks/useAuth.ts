import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setCredentials,
  setError,
  setLoading,
  logout as logoutAction,
  selectAuthError,
  selectAuthLoading,
  selectCurrentUser,
  selectIsAuthenticated,
} from '../store/slices/authSlice';
import * as authService from '../services/authService';
import { setAuthToken, removeAuthToken } from '../services/api';
import { IUser } from '../types';
import type { AppDispatch } from '../store';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        dispatch(setLoading(true));
        const resp = await authService.login(email, password);
        const { user, accessToken } = resp.data as { user: IUser; accessToken: string };
        setAuthToken(accessToken);
        dispatch(setCredentials({ user, token: accessToken }));
        navigate('/');
      } catch (e: any) {
        const backendError = e?.response?.data;
        let message: string;
        if (backendError?.error && backendError?.message && backendError.error !== backendError.message) {
          message = `${backendError.error}: ${backendError.message}`;
        } else if (backendError?.error) {
          message = backendError.error;
        } else if (backendError?.message) {
          message = backendError.message;
        } else {
          message = 'Login failed. Please check your credentials and try again.';
        }
        dispatch(setError(message));
      }
    },
    [dispatch, navigate]
  );

  const register = useCallback(
    async (
      name: string, 
      email: string, 
      password: string, 
      phone?: string, 
      role?: string, 
      skipAuth?: boolean,
      permissions?: {
        canViewSiteLeads?: boolean;
        canVerifyTutors?: boolean;
        canCreateLeads?: boolean;
        canManagePayments?: boolean;
      }
    ): Promise<boolean> => {
      try {
        dispatch(setLoading(true));
        const resp = await authService.register(name, email, password, phone, role, skipAuth, permissions);
        
        if (!skipAuth) {
          const { user, accessToken } = resp.data as { user: IUser; accessToken: string };
          dispatch(setCredentials({ user, token: accessToken }));
          navigate('/');
        } else {
          dispatch(setLoading(false));
        }
        return true;
      } catch (e: any) {
        const backendError = e?.response?.data;
        const message =
          backendError?.error ||
          backendError?.message ||
          'Registration failed. Please check your details and try again.';
        dispatch(setError(message));
        return false;
      }
    },
    [dispatch, navigate]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    removeAuthToken();
    dispatch(logoutAction());
    navigate('/login');
  }, [dispatch, navigate]);

  const clearError = useCallback(() => {
    dispatch(setError(null));
  }, [dispatch]);

  return { user, isAuthenticated, loading, error, login, register, logout, clearError };
};

export default useAuth;
