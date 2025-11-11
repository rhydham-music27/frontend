import api from './api';
import { API_ENDPOINTS } from '../constants';
import { ApiResponse, PaginatedResponse, IManager, IManagerMetrics, IManagerPerformanceHistory, IUser } from '../types';

export const getMyProfile = async (): Promise<ApiResponse<IManager>> => {
  const { data } = await api.get(API_ENDPOINTS.MANAGERS_MY_PROFILE);
  return data as ApiResponse<IManager>;
};

export const getMyMetrics = async (
  fromDate?: string,
  toDate?: string
): Promise<ApiResponse<IManagerMetrics>> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const url = `${API_ENDPOINTS.MANAGERS_MY_METRICS}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<IManagerMetrics>;
};

export const getMyActivityLog = async (
  page: number,
  limit: number,
  actionType?: string,
  fromDate?: string,
  toDate?: string,
  entityType?: string
): Promise<PaginatedResponse<any[]>> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (actionType) params.append('actionType', actionType);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  if (entityType) params.append('entityType', entityType);
  const url = `${API_ENDPOINTS.MANAGERS_MY_ACTIVITY_LOG}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as PaginatedResponse<any[]>;
};

// List all managers with pagination and filters
export const getAllManagers = async (
  page: number,
  limit: number,
  isActive?: boolean,
  department?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<PaginatedResponse<IManager[]>> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (typeof isActive === 'boolean') params.append('isActive', String(isActive));
  if (department) params.append('department', department);
  if (sortBy) params.append('sortBy', sortBy);
  if (sortOrder) params.append('sortOrder', sortOrder);
  const url = `${API_ENDPOINTS.MANAGERS}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as PaginatedResponse<IManager[]>;
};

export const getManagerById = async (managerId: string): Promise<ApiResponse<IManager>> => {
  const { data } = await api.get(`${API_ENDPOINTS.MANAGERS}/${managerId}`);
  return data as ApiResponse<IManager>;
};

export const getManagerMetrics = async (
  managerId: string,
  fromDate?: string,
  toDate?: string
): Promise<ApiResponse<IManagerMetrics>> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const url = `${API_ENDPOINTS.MANAGERS_METRICS(managerId)}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<IManagerMetrics>;
};

export const getManagerPerformanceHistory = async (
  managerId: string,
  fromDate: string,
  toDate: string,
  groupBy?: 'day' | 'week' | 'month'
): Promise<ApiResponse<IManagerPerformanceHistory[]>> => {
  const params = new URLSearchParams();
  params.append('fromDate', fromDate);
  params.append('toDate', toDate);
  if (groupBy) params.append('groupBy', groupBy);
  const url = `${API_ENDPOINTS.MANAGERS_PERFORMANCE_HISTORY(managerId)}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<IManagerPerformanceHistory[]>;
};

export const getManagerContribution = async (
  managerId: string,
  fromDate?: string,
  toDate?: string
): Promise<ApiResponse<any>> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const url = `${API_ENDPOINTS.MANAGERS_CONTRIBUTION(managerId)}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<any>;
};

export const updateManagerProfile = async (
  managerId: string,
  updateData: Partial<{ department: string; isActive: boolean }>
): Promise<ApiResponse<IManager>> => {
  const { data } = await api.put(`${API_ENDPOINTS.MANAGERS}/${managerId}`, updateData);
  return data as ApiResponse<IManager>;
};

// Eligible users for manager profile creation
export const getEligibleManagerUsers = async (): Promise<ApiResponse<IUser[]>> => {
  const { data } = await api.get(`${API_ENDPOINTS.MANAGERS}/eligible-users`);
  return data as ApiResponse<IUser[]>;
};

// Create a manager profile
export const createManagerProfile = async (
  payload: { userId: string; department?: string }
): Promise<ApiResponse<IManager>> => {
  const { data } = await api.post(API_ENDPOINTS.MANAGERS, payload);
  return data as ApiResponse<IManager>;
};

// Delete a manager profile
export const deleteManagerProfile = async (
  managerId: string
): Promise<ApiResponse<boolean>> => {
  const { data } = await api.delete(`${API_ENDPOINTS.MANAGERS}/${managerId}`);
  return data as ApiResponse<boolean>;
};

export default {
  createManagerProfile,
  deleteManagerProfile,
  getAllManagers,
  getMyProfile,
  getMyMetrics,
  getMyActivityLog,
  getEligibleManagerUsers,
  getManagerById,
  getManagerMetrics,
  getManagerPerformanceHistory,
  getManagerContribution,
  updateManagerProfile,
};
