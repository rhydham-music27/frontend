import api from './api';
import { API_ENDPOINTS } from '../constants';
import { ApiResponse, PaginatedResponse, IFinalClass, IParentDashboardStats, IPayment } from '../types';

// Student-specific services
export const getStudentDashboardStats = async (): Promise<ApiResponse<IParentDashboardStats>> => {
  const { data } = await api.get('/api/students/student/dashboard/stats');
  return data as ApiResponse<IParentDashboardStats>;
};

export const getStudentClasses = async (
  params: { status?: string; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<IFinalClass[]>> => {
  const search = new URLSearchParams();
  if (params.status) search.append('status', params.status);
  if (params.page) search.append('page', String(params.page));
  if (params.limit) search.append('limit', String(params.limit));
  const query = search.toString();
  const url = query ? `/api/students/student/classes?${query}` : '/api/students/student/classes';
  const { data } = await api.get(url);
  return data as PaginatedResponse<IFinalClass[]>;
};

export const getStudentAttendance = async (
  params: { month?: string; page?: number; limit?: number } = {}
): Promise<any> => {
  const search = new URLSearchParams();
  if (params.month) search.append('month', params.month);
  if (params.page) search.append('page', String(params.page));
  if (params.limit) search.append('limit', String(params.limit));
  const query = search.toString();
  const url = query ? `/api/students/student/attendance?${query}` : '/api/students/student/attendance';
  const { data } = await api.get(url);
  return data;
};

export const getStudentPayments = async (
  params: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<IPayment[]>> => {
  const search = new URLSearchParams();
  if (params.page) search.append('page', String(params.page));
  if (params.limit) search.append('limit', String(params.limit));
  const query = search.toString();
  const url = query ? `/api/students/student/payments?${query}` : '/api/students/student/payments';
  const { data } = await api.get(url);
  return data as PaginatedResponse<IPayment[]>;
};

export const getStudentTests = async (
  params: { status?: string; page?: number; limit?: number } = {}
): Promise<any> => {
  const search = new URLSearchParams();
  if (params.status) search.append('status', params.status);
  if (params.page) search.append('page', String(params.page));
  if (params.limit) search.append('limit', String(params.limit));
  const query = search.toString();
  const url = query ? `/api/students/student/tests?${query}` : '/api/students/student/tests';
  const { data } = await api.get(url);
  return data;
};

export const getStudentNotes = async (
  params: { subject?: string; type?: string; page?: number; limit?: number; parentId?: string | null } = {}
): Promise<any> => {
  const search = new URLSearchParams();
  if (params.subject) search.append('subject', params.subject);
  if (params.type) search.append('type', params.type);
  if (params.page) search.append('page', String(params.page));
  if (params.limit) search.append('limit', String(params.limit));
  if (params.parentId) search.append('parentId', params.parentId);
  const query = search.toString();
  const url = query ? `/api/students/student/notes?${query}` : '/api/students/student/notes';
  const { data } = await api.get(url);
  return data;
};

// Parent services (existing)
export const getParentDashboardStats = async (): Promise<ApiResponse<IParentDashboardStats>> => {
  const { data } = await api.get(API_ENDPOINTS.STUDENTS_DASHBOARD_STATS);
  return data as ApiResponse<IParentDashboardStats>;
};

export const getParentClasses = async (
  params: { status?: string; page?: number; limit?: number } = {}
): Promise<PaginatedResponse<IFinalClass[]>> => {
  const search = new URLSearchParams();
  if (params.status) search.append('status', params.status);
  if (params.page) search.append('page', String(params.page));
  if (params.limit) search.append('limit', String(params.limit));
  const query = search.toString();
  const url = query ? `${API_ENDPOINTS.STUDENTS_MY_CLASSES}?${query}` : API_ENDPOINTS.STUDENTS_MY_CLASSES;
  const { data } = await api.get(url);
  return data as PaginatedResponse<IFinalClass[]>;
};

export const getParentAnnouncements = async (
  params: { page?: number; limit?: number; fromDate?: string; toDate?: string } = {}
): Promise<PaginatedResponse<any[]>> => {
  const search = new URLSearchParams();
  if (params.page) search.append('page', String(params.page));
  if (params.limit) search.append('limit', String(params.limit));
  if (params.fromDate) search.append('fromDate', params.fromDate);
  if (params.toDate) search.append('toDate', params.toDate);
  const query = search.toString();
  const url = query ? `${API_ENDPOINTS.STUDENTS_MY_ANNOUNCEMENTS}?${query}` : API_ENDPOINTS.STUDENTS_MY_ANNOUNCEMENTS;
  const { data } = await api.get(url);
  return data as PaginatedResponse<any[]>;
};

export default {
  getStudentDashboardStats,
  getStudentClasses,
  getStudentAttendance,
  getStudentTests,
  getStudentNotes,
  getStudentPayments,
  getParentDashboardStats,
  getParentClasses,
  getParentAnnouncements,
};
