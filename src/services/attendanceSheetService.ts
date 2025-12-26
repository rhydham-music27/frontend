import api from './api';
import { ApiResponse } from '../types';

export interface IAttendanceSheet {
  id: string;
  finalClass: any;
  coordinator: any;
  month: number;
  year: number;
  periodLabel?: string;
  totalSessionsPlanned?: number;
  totalSessionsTaken?: number;
  presentCount?: number;
  absentCount?: number;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

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
  approveAttendanceSheet,
  rejectAttendanceSheet,
};
