import api from './api';
import { ApiResponse, IAttendanceSheet } from '../types';

export const upsertAttendanceSheet = async (
  finalClassId: string,
  month: number,
  year: number
): Promise<ApiResponse<IAttendanceSheet>> => {
  const { data } = await api.post('/api/attendance-sheets', { finalClassId, month, year });
  return data as ApiResponse<IAttendanceSheet>;
};

export const submitAttendanceSheet = async (
  sheetId: string
): Promise<ApiResponse<IAttendanceSheet>> => {
  const { data } = await api.patch(`/api/attendance-sheets/${sheetId}/submit`);
  return data as ApiResponse<IAttendanceSheet>;
};

export const getCoordinatorPendingSheets = async (): Promise<ApiResponse<IAttendanceSheet[]>> => {
  const { data } = await api.get('/api/attendance-sheets/coordinator/pending');
  return data as ApiResponse<IAttendanceSheet[]>;
};

export const getAllPendingSheets = async (): Promise<ApiResponse<IAttendanceSheet[]>> => {
  const { data } = await api.get('/api/attendance-sheets/pending');
  return data as ApiResponse<IAttendanceSheet[]>;
};

export const approveAttendanceSheet = async (
  sheetId: string
): Promise<ApiResponse<IAttendanceSheet>> => {
  const { data } = await api.patch(`/api/attendance-sheets/${sheetId}/approve`);
  return data as ApiResponse<IAttendanceSheet>;
};

export const rejectAttendanceSheet = async (
  sheetId: string,
  rejectionReason: string
): Promise<ApiResponse<IAttendanceSheet>> => {
  const { data } = await api.patch(`/api/attendance-sheets/${sheetId}/reject`, { rejectionReason });
  return data as ApiResponse<IAttendanceSheet>;
};

export default {
  upsertAttendanceSheet,
  submitAttendanceSheet,
  getCoordinatorPendingSheets,
  getAllPendingSheets,
  approveAttendanceSheet,
  rejectAttendanceSheet,
};
