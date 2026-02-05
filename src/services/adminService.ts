import api from './api';
import { API_ENDPOINTS } from '../constants';
import { ApiResponse, PaginatedResponse, IAdmin, IAdminAnalytics, IUser, IAdvancedAnalytics } from '../types';

// Section 1: Admin Profile CRUD Functions
export const getMyProfile = async (): Promise<ApiResponse<IAdmin>> => {
  const { data } = await api.get(API_ENDPOINTS.ADMIN_MY_PROFILE);
  return data as ApiResponse<IAdmin>;
};

export const getAllAdmins = async (
  page: number,
  limit: number,
  isActive?: boolean,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Promise<PaginatedResponse<IAdmin[]>> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (typeof isActive === 'boolean') params.append('isActive', String(isActive));
  if (sortBy) params.append('sortBy', sortBy);
  if (sortOrder) params.append('sortOrder', sortOrder);
  const url = `${API_ENDPOINTS.ADMIN}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as PaginatedResponse<IAdmin[]>;
};

export const getAdminById = async (adminId: string): Promise<ApiResponse<IAdmin>> => {
  const { data } = await api.get(`${API_ENDPOINTS.ADMIN}/${adminId}`);
  return data as ApiResponse<IAdmin>;
};

export const getAdminByUserId = async (userId: string): Promise<ApiResponse<IAdmin>> => {
  const { data } = await api.get(`${API_ENDPOINTS.ADMIN}/user/${userId}`);
  return data as ApiResponse<IAdmin>;
};

export const createAdminProfile = async (
  payload: { userId: string; department?: string }
): Promise<ApiResponse<IAdmin>> => {
  const { data } = await api.post(API_ENDPOINTS.ADMIN, payload);
  return data as ApiResponse<IAdmin>;
};

export const updateAdminProfile = async (
  adminId: string,
  updateData: Partial<{ department: string; isActive: boolean }>
): Promise<ApiResponse<IAdmin>> => {
  const { data } = await api.put(`${API_ENDPOINTS.ADMIN}/${adminId}`, updateData);
  return data as ApiResponse<IAdmin>;
};

export const deleteAdminProfile = async (
  adminId: string
): Promise<ApiResponse<boolean>> => {
  const { data } = await api.delete(`${API_ENDPOINTS.ADMIN}/${adminId}`);
  return data as ApiResponse<boolean>;
};

// Section 2: System Analytics Function
export const getSystemWideAnalytics = async (
  fromDate?: string,
  toDate?: string,
  city?: string
): Promise<ApiResponse<IAdminAnalytics>> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  if (city) params.append('city', city);
  const url = `${API_ENDPOINTS.ADMIN_ANALYTICS}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<IAdminAnalytics>;
};

// ... (skipping unchanged code)

// Section 5: Export Functions
export const exportAnalyticsCSV = async (
  reportType: string,
  fromDate?: string,
  toDate?: string,
  city?: string
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('reportType', reportType);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  if (city) params.append('city', city);
  const url = `${API_ENDPOINTS.ADMIN_ANALYTICS}/export/csv?${params.toString()}`;
  const { data } = await api.get(url, { responseType: 'blob' });
  return data as Blob;
};

export const exportAnalyticsPDF = async (
  reportType: string,
  fromDate?: string,
  toDate?: string,
  city?: string
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('reportType', reportType);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  if (city) params.append('city', city);
  const url = `${API_ENDPOINTS.ADMIN_ANALYTICS}/export/pdf?${params.toString()}`;
  const { data } = await api.get(url, { responseType: 'blob' });
  return data as Blob;
};

export const getApprovalLists = async (): Promise<ApiResponse<any>> => {
  const { data } = await api.get(`${API_ENDPOINTS.ADMIN}/approvals`);
  return data as ApiResponse<any>;
};

export const getAdvancedAnalytics = async (): Promise<ApiResponse<IAdvancedAnalytics>> => {
  const { data } = await api.get(`${API_ENDPOINTS.ADMIN}/advanced-analytics`);
  return data as ApiResponse<IAdvancedAnalytics>;
};

export default {
  // Profile CRUD
  getMyProfile,
  getAllAdmins,
  getAdminById,
  getAdminByUserId,
  createAdminProfile,
  updateAdminProfile,
  deleteAdminProfile,
  // Analytics
  getSystemWideAnalytics,
  // User Management
  // createUserWithRole,
  // bulkCreateUsers,
  // Bulk Operations
  // bulkUpdateUsers,
  // bulkUpdateManagers,
  // bulkUpdateCoordinators,
  // bulkUpdatePayments,
  // bulkDeleteRecords,
  // Export
  exportAnalyticsCSV,
  exportAnalyticsPDF,
  // Approvals
  getApprovalLists,
  // Advanced Analytics
  getAdvancedAnalytics,
};
