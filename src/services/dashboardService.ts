import api from './api';
import { API_ENDPOINTS } from '../constants';
import {
  ApiResponse,
  PaginatedResponse,
  IDateWiseData,
  IStatusDistribution,
  IConversionFunnel,
  IClassProgress,
  ITutorPerformance,
  ICumulativeGrowth,
  IPendingApprovals,
  IRevenueAnalytics,
  IDashboardStatistics,
} from '../types';

export const getOverallStats = async (
  fromDate?: string,
  toDate?: string
): Promise<ApiResponse<IDashboardStatistics>> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const url = `${API_ENDPOINTS.DASHBOARD_STATS}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<IDashboardStatistics>; 
};

export const getDateWiseLeads = async (
  fromDate?: string,
  toDate?: string,
  groupBy?: 'day' | 'week' | 'month'
): Promise<ApiResponse<IDateWiseData[]>> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  if (groupBy) params.append('groupBy', groupBy);
  const url = `${API_ENDPOINTS.DASHBOARD_LEADS_DATE_WISE}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<IDateWiseData[]>;
};

export const getLeadStatusDistribution = async (
  fromDate?: string,
  toDate?: string
): Promise<ApiResponse<IStatusDistribution[]>> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const url = `${API_ENDPOINTS.DASHBOARD_LEADS_STATUS_DISTRIBUTION}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<IStatusDistribution[]>;
};

export const getConversionFunnel = async (
  fromDate?: string,
  toDate?: string
): Promise<ApiResponse<IConversionFunnel>> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const url = `${API_ENDPOINTS.DASHBOARD_CONVERSION_FUNNEL}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<IConversionFunnel>;
};

export const getClassProgress = async (
  fromDate?: string,
  toDate?: string
): Promise<ApiResponse<IClassProgress>> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const url = `${API_ENDPOINTS.DASHBOARD_CLASSES_PROGRESS}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<IClassProgress>;
};

export const getCumulativeGrowth = async (
  fromDate: string,
  toDate: string,
  groupBy?: 'day' | 'week' | 'month'
): Promise<ApiResponse<ICumulativeGrowth[]>> => {
  const params = new URLSearchParams();
  params.append('fromDate', fromDate);
  params.append('toDate', toDate);
  if (groupBy) params.append('groupBy', groupBy);
  const url = `${API_ENDPOINTS.DASHBOARD_CLASSES_CUMULATIVE_GROWTH}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<ICumulativeGrowth[]>;
};

export const getTutorProgressReport = async (
  page: number,
  limit: number,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  fromDate?: string,
  toDate?: string
): Promise<PaginatedResponse<ITutorPerformance[]>> => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (sortBy) params.append('sortBy', sortBy);
  if (sortOrder) params.append('sortOrder', sortOrder);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const url = `${API_ENDPOINTS.DASHBOARD_TUTORS_PROGRESS_REPORT}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as PaginatedResponse<ITutorPerformance[]>;
};

export const getPendingApprovals = async (): Promise<ApiResponse<IPendingApprovals>> => {
  const { data } = await api.get(API_ENDPOINTS.DASHBOARD_PENDING_APPROVALS);
  return data as ApiResponse<IPendingApprovals>;
};

export const getRevenueAnalytics = async (
  fromDate?: string,
  toDate?: string,
  groupBy?: 'day' | 'week' | 'month'
): Promise<ApiResponse<IRevenueAnalytics>> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  if (groupBy) params.append('groupBy', groupBy);
  const url = `${API_ENDPOINTS.DASHBOARD_REVENUE_ANALYTICS}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<IRevenueAnalytics>;
};

export const exportDashboardCSV = async (
  reportType: string,
  fromDate?: string,
  toDate?: string
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('reportType', reportType);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const url = `${API_ENDPOINTS.DASHBOARD_EXPORT_CSV}?${params.toString()}`;
  const { data } = await api.get(url, { responseType: 'blob' });
  return data as Blob;
};

export const exportDashboardPDF = async (
  reportType: string,
  fromDate?: string,
  toDate?: string
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('reportType', reportType);
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const url = `${API_ENDPOINTS.DASHBOARD_EXPORT_PDF}?${params.toString()}`;
  const { data } = await api.get(url, { responseType: 'blob' });
  return data as Blob;
};

export default {
  getOverallStats,
  getDateWiseLeads,
  getLeadStatusDistribution,
  getConversionFunnel,
  getClassProgress,
  getCumulativeGrowth,
  getTutorProgressReport,
  getPendingApprovals,
  getRevenueAnalytics,
  exportDashboardCSV,
  exportDashboardPDF,
};
