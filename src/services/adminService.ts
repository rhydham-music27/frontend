import api from './api';
import { API_ENDPOINTS } from '../constants';
import { ApiResponse, PaginatedResponse, IAdmin, IAdminAnalytics, IUser } from '../types';

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
  toDate?: string
): Promise<ApiResponse<IAdminAnalytics>> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const url = `${API_ENDPOINTS.ADMIN_ANALYTICS}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<IAdminAnalytics>;
};

// Section 3: User Management Functions
export const createUserWithRole = async (
  userData: { name: string; email: string; password: string; phone?: string; role: string }
): Promise<ApiResponse<{ user: IUser; profile: any }>> => {
  const { data } = await api.post(API_ENDPOINTS.ADMIN_USERS, userData);
  return data as ApiResponse<{ user: IUser; profile: any }>;
};

export const bulkCreateUsers = async (
  usersData: Array<{ name: string; email: string; password: string; phone?: string; role: string }>
): Promise<ApiResponse<{ created: any[]; failed: any[]; summary: { total: number; successful: number; failed: number } }>> => {
  const { data } = await api.post(`${API_ENDPOINTS.ADMIN_USERS}/bulk`, usersData);
  return data as ApiResponse<{ created: any[]; failed: any[]; summary: { total: number; successful: number; failed: number } }>;
};

// Section 4: Bulk Data Operations Functions
export const bulkUpdateUsers = async (
  filter: { role?: string; isActive?: boolean; ids?: string[] },
  updateData: Partial<{ isActive: boolean }>
): Promise<ApiResponse<{ modifiedCount: number; filter: any; updateData: any }>> => {
  const { data } = await api.put(API_ENDPOINTS.ADMIN_BULK_USERS, { filter, updateData });
  return data as ApiResponse<{ modifiedCount: number; filter: any; updateData: any }>;
};

export const bulkUpdateManagers = async (
  filter: { isActive?: boolean; department?: string; ids?: string[] },
  updateData: Partial<{ isActive: boolean; department: string }>
): Promise<ApiResponse<{ modifiedCount: number; filter: any; updateData: any }>> => {
  const { data } = await api.put(API_ENDPOINTS.ADMIN_BULK_MANAGERS, { filter, updateData });
  return data as ApiResponse<{ modifiedCount: number; filter: any; updateData: any }>;
};

export const bulkUpdateCoordinators = async (
  filter: { isActive?: boolean; ids?: string[] },
  updateData: Partial<{ isActive: boolean; maxClassCapacity: number }>
): Promise<ApiResponse<{ modifiedCount: number; filter: any; updateData: any }>> => {
  const { data } = await api.put(API_ENDPOINTS.ADMIN_BULK_COORDINATORS, { filter, updateData });
  return data as ApiResponse<{ modifiedCount: number; filter: any; updateData: any }>;
};

export const bulkUpdatePayments = async (
  filter: { status?: string; finalClassId?: string; tutorId?: string; ids?: string[]; fromDate?: string; toDate?: string },
  updateData: Partial<{ status: string; paymentDate?: string; paidBy?: string }>
): Promise<ApiResponse<{ modifiedCount: number; filter: any; updateData: any }>> => {
  const { data } = await api.put(API_ENDPOINTS.ADMIN_BULK_PAYMENTS, { filter, updateData });
  return data as ApiResponse<{ modifiedCount: number; filter: any; updateData: any }>;
};

export const bulkDeleteRecords = async (
  entityType: 'ClassLead' | 'Payment' | 'Attendance',
  filter: { ids: string[] }
): Promise<ApiResponse<{ deletedCount: number; entityType: string; ids: string[] }>> => {
  const { data } = await api.delete(API_ENDPOINTS.ADMIN_BULK_RECORDS, { data: { entityType, filter } });
  return data as ApiResponse<{ deletedCount: number; entityType: string; ids: string[] }>;
};

// Section 5: Export Functions
export const exportAnalyticsCSV = async (
  reportType: string,
  fromDate?: string,
  toDate?: string
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('reportType', reportType);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const url = `${API_ENDPOINTS.ADMIN_ANALYTICS}/export/csv?${params.toString()}`;
  const { data } = await api.get(url, { responseType: 'blob' });
  return data as Blob;
};

export const exportAnalyticsPDF = async (
  reportType: string,
  fromDate?: string,
  toDate?: string
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('reportType', reportType);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const url = `${API_ENDPOINTS.ADMIN_ANALYTICS}/export/pdf?${params.toString()}`;
  const { data } = await api.get(url, { responseType: 'blob' });
  return data as Blob;
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
  createUserWithRole,
  bulkCreateUsers,
  // Bulk Operations
  bulkUpdateUsers,
  bulkUpdateManagers,
  bulkUpdateCoordinators,
  bulkUpdatePayments,
  bulkDeleteRecords,
  // Export
  exportAnalyticsCSV,
  exportAnalyticsPDF,
};
