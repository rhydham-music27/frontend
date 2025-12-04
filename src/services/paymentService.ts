import api from './api';
import { API_ENDPOINTS } from '../constants';
import { ApiResponse, PaginatedResponse, IPayment, IPaymentStatistics, IPaymentReminderFormData } from '../types';

export type GetPaymentsQuery = {
  page?: number;
  limit?: number;
  status?: string;
  tutorId?: string;
  finalClassId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export const getPayments = async (
  query: GetPaymentsQuery = {}
): Promise<PaginatedResponse<IPayment[]>> => {
  const params = new URLSearchParams();
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));
  if (query.status) params.append('status', query.status);
  if (query.tutorId) params.append('tutorId', query.tutorId);
  if (query.finalClassId) params.append('finalClassId', query.finalClassId);
  if (query.fromDate) params.append('fromDate', query.fromDate);
  if (query.toDate) params.append('toDate', query.toDate);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);
  const url = `${API_ENDPOINTS.PAYMENTS}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as PaginatedResponse<IPayment[]>;
};

export const getPaymentById = async (paymentId: string): Promise<ApiResponse<IPayment>> => {
  const { data } = await api.get(`${API_ENDPOINTS.PAYMENTS}/${paymentId}`);
  return data as ApiResponse<IPayment>;
};

export const createPayment = async (
  attendanceId: string
): Promise<ApiResponse<IPayment>> => {
  const { data } = await api.post(API_ENDPOINTS.PAYMENTS, { attendanceId });
  return data as ApiResponse<IPayment>;
};

export const updatePayment = async (
  paymentId: string,
  payload: Partial<{ amount: number; dueDate: string; notes: string }>
): Promise<ApiResponse<IPayment>> => {
  const { data } = await api.put(`${API_ENDPOINTS.PAYMENTS}/${paymentId}`, payload);
  return data as ApiResponse<IPayment>;
};

export const updatePaymentStatus = async (
  paymentId: string,
  payload: { status: string; paymentMethod?: string; transactionId?: string; notes?: string }
): Promise<ApiResponse<IPayment>> => {
  // Use the correct endpoint for updating payment status
  const { data } = await api.patch(`${API_ENDPOINTS.PAYMENTS}/${paymentId}/status`, {
    status: payload.status,
    paymentMethod: payload.paymentMethod,
    transactionId: payload.transactionId,
    notes: payload.notes
  });
  return data as ApiResponse<IPayment>;
};

export const deletePayment = async (paymentId: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete(`${API_ENDPOINTS.PAYMENTS}/${paymentId}`);
  return data as ApiResponse<null>;
};

export const getPaymentsByTutor = async (
  tutorId: string,
  filters: { status?: string; fromDate?: string; toDate?: string } = {}
): Promise<ApiResponse<{ payments: IPayment[]; statistics: IPaymentStatistics }>> => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.fromDate) params.append('fromDate', filters.fromDate);
  if (filters.toDate) params.append('toDate', filters.toDate);
  const { data } = await api.get(
    `${API_ENDPOINTS.PAYMENTS_TUTOR(tutorId)}?${params.toString()}`
  );
  return data as ApiResponse<{ payments: IPayment[]; statistics: IPaymentStatistics }>;
};

export const getPaymentsByClass = async (
  classId: string,
  status?: string
): Promise<ApiResponse<{ payments: IPayment[]; statistics: IPaymentStatistics }>> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  const { data } = await api.get(
    `${API_ENDPOINTS.PAYMENTS_CLASS(classId)}?${params.toString()}`
  );
  return data as ApiResponse<{ payments: IPayment[]; statistics: IPaymentStatistics }>;
};

export const getPaymentStatistics = async (
  filters: { fromDate?: string; toDate?: string; tutorId?: string } = {}
): Promise<ApiResponse<IPaymentStatistics>> => {
  const params = new URLSearchParams();
  if (filters.fromDate) params.append('fromDate', filters.fromDate);
  if (filters.toDate) params.append('toDate', filters.toDate);
  if (filters.tutorId) params.append('tutorId', filters.tutorId);
  const url = `${API_ENDPOINTS.PAYMENTS_STATISTICS}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<IPaymentStatistics>;
};

export const sendPaymentReminder = async (
  paymentId: string,
  reminderMessage?: string
): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  const { data } = await api.post(
    `${API_ENDPOINTS.PAYMENTS_SEND_REMINDER(paymentId)}`,
    { reminderMessage }
  );
  return data as ApiResponse<{ success: boolean; message: string }>;
};

export const getMyPaymentSummary = async (
  filters: { status?: string; fromDate?: string; toDate?: string } = {}
): Promise<ApiResponse<{ payments: IPayment[]; statistics: IPaymentStatistics }>> => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.fromDate) params.append('fromDate', filters.fromDate);
  if (filters.toDate) params.append('toDate', filters.toDate);
  const url = `${API_ENDPOINTS.PAYMENTS_MY_SUMMARY}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<{ payments: IPayment[]; statistics: IPaymentStatistics }>;
};

export const getParentPayments = async (
  filters: { status?: string; fromDate?: string; toDate?: string } = {}
): Promise<ApiResponse<{ payments: IPayment[]; statistics: IPaymentStatistics }>> => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.fromDate) params.append('fromDate', filters.fromDate);
  if (filters.toDate) params.append('toDate', filters.toDate);
  const url = `${API_ENDPOINTS.PAYMENTS_PARENT_MY_PAYMENTS}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as ApiResponse<{ payments: IPayment[]; statistics: IPaymentStatistics }>;
};

export const downloadPaymentReceipt = async (paymentId: string): Promise<void> => {
  const url = API_ENDPOINTS.PAYMENTS_RECEIPT(paymentId);
  window.open(url, '_blank');
};

export default {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
  getPaymentsByTutor,
  getPaymentsByClass,
  getPaymentStatistics,
  sendPaymentReminder,
  getMyPaymentSummary,
  getParentPayments,
  downloadPaymentReceipt,
};
