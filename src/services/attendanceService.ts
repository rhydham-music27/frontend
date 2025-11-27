import api from './api';
import { API_ENDPOINTS } from '../constants';
import {
  ApiResponse,
  PaginatedResponse,
  IAttendance,
  IAttendanceStatistics,
} from '../types';

export type GetAttendancesQuery = {
  page?: number;
  limit?: number;
  finalClassId?: string;
  status?: string;
  tutorId?: string;
  coordinatorId?: string;
  parentId?: string;
  fromDate?: string;
  toDate?: string;
};

export const getAttendances = async (
  query: GetAttendancesQuery = {}
): Promise<PaginatedResponse<IAttendance[]>> => {
  const params = new URLSearchParams();
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));
  if (query.finalClassId) params.append('finalClassId', query.finalClassId);
  if (query.status) params.append('status', query.status);
  if (query.tutorId) params.append('tutorId', query.tutorId);
  if (query.coordinatorId) params.append('coordinatorId', query.coordinatorId);
  if (query.parentId) params.append('parentId', query.parentId);
  if (query.fromDate) params.append('fromDate', query.fromDate);
  if (query.toDate) params.append('toDate', query.toDate);
  const url = `${API_ENDPOINTS.ATTENDANCE}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as PaginatedResponse<IAttendance[]>;
};

export const getAttendanceById = async (
  attendanceId: string
): Promise<ApiResponse<IAttendance>> => {
  const { data } = await api.get(`${API_ENDPOINTS.ATTENDANCE}/${attendanceId}`);
  return data as ApiResponse<IAttendance>;
};

export type CreateAttendancePayload = {
  finalClassId: string;
  sessionDate: string;
  topicCovered?: string;
  notes?: string;
  studentAttendanceStatus?: string;
};

export const createAttendance = async (
  payload: CreateAttendancePayload
): Promise<ApiResponse<IAttendance>> => {
  const { data } = await api.post(API_ENDPOINTS.ATTENDANCE, payload);
  return data as ApiResponse<IAttendance>;
};

export const updateAttendance = async (
  attendanceId: string,
  update: Partial<CreateAttendancePayload> & { status?: string; notes?: string }
): Promise<ApiResponse<IAttendance>> => {
  const { data } = await api.put(`${API_ENDPOINTS.ATTENDANCE}/${attendanceId}`, update);
  return data as ApiResponse<IAttendance>;
};

export const deleteAttendance = async (
  attendanceId: string
): Promise<ApiResponse<null>> => {
  const { data } = await api.delete(`${API_ENDPOINTS.ATTENDANCE}/${attendanceId}`);
  return data as ApiResponse<null>;
};

export const coordinatorApprove = async (
  attendanceId: string
): Promise<ApiResponse<IAttendance>> => {
  const { data } = await api.patch(
    `${API_ENDPOINTS.ATTENDANCE_APPROVE_COORDINATOR(attendanceId)}`
  );
  return data as ApiResponse<IAttendance>;
};

export const parentApprove = async (
  attendanceId: string
): Promise<ApiResponse<IAttendance>> => {
  const { data } = await api.patch(`${API_ENDPOINTS.ATTENDANCE_APPROVE_PARENT(attendanceId)}`);
  return data as ApiResponse<IAttendance>;
};

export const rejectAttendance = async (
  attendanceId: string,
  rejectionReason: string
): Promise<ApiResponse<IAttendance>> => {
  const { data } = await api.patch(`${API_ENDPOINTS.ATTENDANCE_REJECT(attendanceId)}`, {
    rejectionReason,
  });
  return data as ApiResponse<IAttendance>;
};

export const getCoordinatorPendingApprovals = async (): Promise<ApiResponse<IAttendance[]>> => {
  const { data } = await api.get(API_ENDPOINTS.ATTENDANCE_COORDINATOR_PENDING);
  return data as ApiResponse<IAttendance[]>;
};

export const getParentPendingApprovals = async (): Promise<ApiResponse<IAttendance[]>> => {
  const { data } = await api.get(API_ENDPOINTS.ATTENDANCE_PARENT_PENDING);
  return data as ApiResponse<IAttendance[]>;
};

export const getAttendanceByClass = async (
  classId: string,
  status?: string
): Promise<ApiResponse<IAttendance[]>> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  const { data } = await api.get(
    `${API_ENDPOINTS.ATTENDANCE_CLASS(classId)}?${params.toString()}`
  );
  return data as ApiResponse<IAttendance[]>;
};

export const getAttendanceHistory = async (
  classId: string
): Promise<ApiResponse<{ attendances: IAttendance[]; statistics: IAttendanceStatistics }>> => {
  const { data } = await api.get(`${API_ENDPOINTS.ATTENDANCE_HISTORY(classId)}`);
  return data as ApiResponse<{ attendances: IAttendance[]; statistics: IAttendanceStatistics }>;
};

export const getMyAttendanceSummary = async (): Promise<
  ApiResponse<
    Array<{
      classId: string;
      className: string;
      studentName: string;
      totalSessionsTaken: number;
      presentCount: number;
    }>
  >
> => {
  const { data } = await api.get(API_ENDPOINTS.ATTENDANCE_TUTOR_SUMMARY);
  return data as ApiResponse<
    Array<{
      classId: string;
      className: string;
      studentName: string;
      totalSessionsTaken: number;
      presentCount: number;
    }>
  >;
};

export const downloadClassAttendancePdf = async (classId: string): Promise<void> => {
  const url = API_ENDPOINTS.ATTENDANCE_CLASS_EXPORT_PDF(classId);
  const response = await api.get(url, { responseType: 'blob' });

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `attendance-${classId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
};

// Fetches the attendance PDF as a Blob so it can be rendered inline (e.g. in an iframe)
export const fetchClassAttendancePdfBlob = async (
  classId: string,
  params?: { start?: string; end?: string }
): Promise<Blob> => {
  const search = new URLSearchParams();
  if (params?.start) search.append('start', params.start);
  if (params?.end) search.append('end', params.end);
  const query = search.toString();
  const url = `${API_ENDPOINTS.ATTENDANCE_CLASS_EXPORT_PDF(classId)}${query ? `?${query}` : ''}`;
  const response = await api.get(url, { responseType: 'blob' });
  return response.data as Blob;
};

export default {
  getAttendances,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  coordinatorApprove,
  parentApprove,
  rejectAttendance,
  getCoordinatorPendingApprovals,
  getParentPendingApprovals,
  getAttendanceByClass,
  getAttendanceHistory,
  getMyAttendanceSummary,
  downloadClassAttendancePdf,
  fetchClassAttendancePdfBlob,
};
