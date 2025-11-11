import api, { setAuthToken, removeAuthToken } from './api';
import { API_ENDPOINTS } from '../constants';
import { ApiResponse, AuthResponse } from '../types';

export const login = async (email: string, password: string) => {
  const res = await api.post<AuthResponse>(API_ENDPOINTS.AUTH_LOGIN, { email, password });
  const raw = res.data.data as any;
  const user = raw.user;
  const accessToken = raw?.tokens?.accessToken ?? raw?.accessToken;
  if (accessToken) setAuthToken(accessToken);
  // Normalize shape so callers can destructure { user, accessToken }
  return { ...res.data, data: { user, accessToken } } as any;
};

export const register = async (
  name: string,
  email: string,
  password: string,
  phone?: string,
  role?: string
) => {
  const res = await api.post<AuthResponse>(API_ENDPOINTS.AUTH_REGISTER, {
    name,
    email,
    password,
    phone,
    role,
  });
  const raw = res.data.data as any;
  const user = raw.user;
  const accessToken = raw?.tokens?.accessToken ?? raw?.accessToken;
  if (accessToken) setAuthToken(accessToken);
  return { ...res.data, data: { user, accessToken } } as any;
};

export const logout = async () => {
  try {
    await api.post<ApiResponse<null>>(API_ENDPOINTS.AUTH_LOGOUT);
  } finally {
    removeAuthToken();
    localStorage.removeItem('user');
  }
};

export const getCurrentUser = async () => {
  const res = await api.get<ApiResponse<any>>(API_ENDPOINTS.AUTH_ME);
  return res.data;
};

export const refreshToken = async (refreshToken: string) => {
  const res = await api.post<ApiResponse<{ accessToken: string }>>(
    API_ENDPOINTS.AUTH_REFRESH_TOKEN,
    { refreshToken }
  );
  const { accessToken } = res.data.data;
  setAuthToken(accessToken);
  return accessToken;
};
