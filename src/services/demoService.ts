import api from './api';
import { API_ENDPOINTS } from '../constants';
import { ApiResponse, IDemoHistory, IClassLead, PaginatedResponse } from '../types';

export const assignDemo = async (
  classLeadId: string,
  tutorUserId: string,
  demoDate: string,
  demoTime: string,
  notes?: string
): Promise<ApiResponse<IClassLead>> => {
  const { data } = await api.post(API_ENDPOINTS.DEMOS_ASSIGN(classLeadId), {
    tutorUserId,
    demoDate,
    demoTime,
    notes,
  });
  return data as ApiResponse<IClassLead>;
};

export const updateDemoStatus = async (
  classLeadId: string,
  status: string,
  feedback?: string,
  rejectionReason?: string,
  coordinatorUserId?: string
): Promise<ApiResponse<IClassLead>> => {
  const { data } = await api.patch(API_ENDPOINTS.DEMOS_STATUS(classLeadId), {
    status,
    feedback,
    rejectionReason,
    coordinatorUserId,
  });
  return data as ApiResponse<IClassLead>;
};

export const editDemo = async (
  classLeadId: string,
  payload: { demoDate?: string; demoTime?: string; notes?: string }
): Promise<ApiResponse<IClassLead>> => {
  const { data } = await api.put(API_ENDPOINTS.DEMOS_EDIT(classLeadId), payload);
  return data as ApiResponse<IClassLead>;
};

export const reassignDemo = async (
  classLeadId: string,
  newTutorUserId: string,
  demoDate: string,
  demoTime: string,
  notes?: string
): Promise<ApiResponse<IClassLead>> => {
  const { data } = await api.post(`${API_ENDPOINTS.DEMOS}/reassign/${classLeadId}`, {
    newTutorUserId,
    demoDate,
    demoTime,
    notes,
  });
  return data as ApiResponse<IClassLead>;
};

export const getDemoHistory = async (
  classLeadId: string
): Promise<ApiResponse<IDemoHistory[]>> => {
  const { data } = await api.get(API_ENDPOINTS.DEMOS_HISTORY(classLeadId));
  return data as ApiResponse<IDemoHistory[]>;
};

export const getMyDemos = async (
  page = 1,
  limit = 10,
  status?: string
): Promise<PaginatedResponse<IDemoHistory[]>> => {
  let url = `${API_ENDPOINTS.DEMOS_MY_DEMOS}?page=${page}&limit=${limit}`;
  if (status) {
    url += `&status=${encodeURIComponent(status)}`;
  }
  const { data } = await api.get(url);
  return data as PaginatedResponse<IDemoHistory[]>;
};

export default {
  assignDemo,
  updateDemoStatus,
  editDemo,
  reassignDemo,
  getDemoHistory,
  getMyDemos,
};
