import api from './api';
import { API_ENDPOINTS } from '../constants';
import { ApiResponse, PaginatedResponse, IClassLead, IClassLeadFormData } from '../types';

export type GetLeadsQuery = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export const getClassLeads = async (
  query: GetLeadsQuery = {}
): Promise<PaginatedResponse<IClassLead[]>> => {
  const params = new URLSearchParams();
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));
  if (query.status) params.append('status', query.status);
  if (query.search) params.append('search', query.search);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);
  const url = `${API_ENDPOINTS.LEADS}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as PaginatedResponse<IClassLead[]>;
};

export const getClassLeadById = async (leadId: string): Promise<ApiResponse<IClassLead>> => {
  const { data } = await api.get(`${API_ENDPOINTS.LEADS}/${leadId}`);
  return data as ApiResponse<IClassLead>;
};

export const createClassLead = async (
  payload: IClassLeadFormData
): Promise<ApiResponse<IClassLead>> => {
  const { data } = await api.post(API_ENDPOINTS.LEADS, payload);
  return data as ApiResponse<IClassLead>;
};

export const updateClassLead = async (
  leadId: string,
  payload: Partial<IClassLeadFormData>
): Promise<ApiResponse<IClassLead>> => {
  const { data } = await api.put(`${API_ENDPOINTS.LEADS}/${leadId}`, payload);
  return data as ApiResponse<IClassLead>;
};

export const updateClassLeadStatus = async (
  leadId: string,
  status: string
): Promise<ApiResponse<IClassLead>> => {
  const { data } = await api.patch(`${API_ENDPOINTS.LEAD_STATUS(leadId)}`, { status });
  return data as ApiResponse<IClassLead>;
};

export const deleteClassLead = async (leadId: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete(`${API_ENDPOINTS.LEADS}/${leadId}`);
  return data as ApiResponse<null>;
};

export const getMyLeads = async (): Promise<ApiResponse<IClassLead[]>> => {
  const { data } = await api.get(API_ENDPOINTS.LEADS_MY);
  return data as ApiResponse<IClassLead[]>;
};

export const getMyTutorLeads = async (): Promise<ApiResponse<IClassLead[]>> => {
  const { data } = await api.get(API_ENDPOINTS.TUTOR_LEADS_MY);
  return data as ApiResponse<IClassLead[]>;
};

export default {
  getClassLeads,
  getClassLeadById,
  createClassLead,
  updateClassLead,
  updateClassLeadStatus,
  deleteClassLead,
  getMyLeads,
  getMyTutorLeads,
};
