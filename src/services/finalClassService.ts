import api from './api';
import { API_ENDPOINTS } from '../constants';
import { PaginatedResponse, IFinalClass, ApiResponse } from '../types';

export const getMyClasses = async (
  tutorId: string,
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<IFinalClass[]>> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  params.append('page', String(page));
  params.append('limit', String(limit));
  const base = `/api/final-classes/tutor/${tutorId}`;
  const url = `${base}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as PaginatedResponse<IFinalClass[]>;
};

export const updateFinalClassSchedule = async (
  classId: string,
  schedule: { daysOfWeek: string[]; timeSlot: string }
): Promise<ApiResponse<IFinalClass>> => {
  const { data } = await api.put(`/api/final-classes/${classId}`, { schedule });
  return data as ApiResponse<IFinalClass>;
};

export const createOneTimeReschedule = async (
  classId: string,
  payload: { fromDate: string; toDate?: string; timeSlot: string }
): Promise<ApiResponse<IFinalClass>> => {
  const { data } = await api.post(`/api/final-classes/${classId}/reschedule`, payload);
  return data as ApiResponse<IFinalClass>;
};

export const requestParentReschedule = async (classId: string): Promise<ApiResponse<null>> => {
  const { data } = await api.post(`/api/final-classes/${classId}/parent-reschedule`);
  return data as ApiResponse<null>;
};

export default { getMyClasses, updateFinalClassSchedule, createOneTimeReschedule, requestParentReschedule };
