import api from './api';
import { API_ENDPOINTS } from '../constants';
import { ApiResponse, PaginatedResponse, ITutor, ITutorFeedback, ITutorPerformanceMetrics, ISubmitFeedbackFormData } from '../types';

export type GetTutorsQuery = {
  page?: number;
  limit?: number;
  verificationStatus?: string;
  isAvailable?: boolean;
  subjects?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export const getTutors = async (
  query: GetTutorsQuery = {}
): Promise<PaginatedResponse<ITutor[]>> => {
  const params = new URLSearchParams();
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));
  if (query.verificationStatus) params.append('verificationStatus', query.verificationStatus);
  if (query.isAvailable !== undefined) params.append('isAvailable', String(query.isAvailable));
  if (query.subjects && query.subjects.length) params.append('subjects', query.subjects.join(','));
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);
  const url = `${API_ENDPOINTS.TUTORS}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as PaginatedResponse<ITutor[]>;
};

export const getTutorById = async (tutorId: string): Promise<ApiResponse<ITutor>> => {
  const { data } = await api.get(`${API_ENDPOINTS.TUTORS}/${tutorId}`);
  return data as ApiResponse<ITutor>;
};

export const getTutorByUserId = async (userId: string): Promise<ApiResponse<ITutor>> => {
  const { data } = await api.get(`${API_ENDPOINTS.TUTORS}/user/${userId}`);
  return data as ApiResponse<ITutor>;
};

export const getMyProfile = async (): Promise<ApiResponse<ITutor>> => {
  const { data } = await api.get(API_ENDPOINTS.TUTORS_MY_PROFILE);
  return data as ApiResponse<ITutor>;
};

export type CreateTutorPayload = {
  userId: string;
  experienceHours: number;
  subjects: string[];
  qualifications?: string[];
  preferredMode?: string;
  preferredLocations?: string[];
};

export const createTutorProfile = async (
  payload: CreateTutorPayload
): Promise<ApiResponse<ITutor>> => {
  const { data } = await api.post(API_ENDPOINTS.TUTORS, payload);
  return data as ApiResponse<ITutor>;
};

export const updateTutorProfile = async (
  tutorId: string,
  payload: Partial<CreateTutorPayload> & Record<string, any>
): Promise<ApiResponse<ITutor>> => {
  const { data } = await api.put(`${API_ENDPOINTS.TUTORS}/${tutorId}`, payload);
  return data as ApiResponse<ITutor>;
};

export const deleteTutorProfile = async (tutorId: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete(`${API_ENDPOINTS.TUTORS}/${tutorId}`);
  return data as ApiResponse<null>;
};

export const uploadDocument = async (
  tutorId: string,
  documentType: string,
  file: File
): Promise<ApiResponse<ITutor>> => {
  const formData = new FormData();
  formData.append('document', file, file.name || 'upload');
  formData.append('documentType', documentType);
  const { data } = await api.post(`${API_ENDPOINTS.TUTORS_DOCUMENTS(tutorId)}`, formData);
  return data as ApiResponse<ITutor>;
};

export const deleteDocument = async (
  tutorId: string,
  documentIndex: number
): Promise<ApiResponse<ITutor>> => {
  const { data } = await api.delete(
    `${API_ENDPOINTS.TUTORS_DELETE_DOCUMENT(tutorId, documentIndex)}`
  );
  return data as ApiResponse<ITutor>;
};

export const updateVerificationStatus = async (
  tutorId: string,
  status: string,
  verificationNotes?: string
): Promise<ApiResponse<ITutor>> => {
  const { data } = await api.patch(
    `${API_ENDPOINTS.TUTORS_VERIFICATION_STATUS(tutorId)}`,
    { status, verificationNotes }
  );
  return data as ApiResponse<ITutor>;
};

export const getPendingVerifications = async (): Promise<ApiResponse<ITutor[]>> => {
  const { data } = await api.get(API_ENDPOINTS.TUTORS_PENDING_VERIFICATIONS);
  return data as ApiResponse<ITutor[]>;
};

export const getTutorsByStatus = async (
  status: string,
  query: { page?: number; limit?: number } = {}
): Promise<PaginatedResponse<ITutor[]>> => {
  const params = new URLSearchParams();
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));
  const { data } = await api.get(`${API_ENDPOINTS.TUTORS}/status/${status}?${params.toString()}`);
  return data as PaginatedResponse<ITutor[]>;
};

export const requestTierChange = async (
  payload: { tutorId: string; newTier: string; reason?: string }
): Promise<ApiResponse<ITutor>> => {
  const { data } = await api.post(API_ENDPOINTS.TUTORS_TIER_REQUEST, payload);
  return data as ApiResponse<ITutor>;
};

export const approveTierChange = async (
  tutorId: string,
  approve: boolean,
  notes?: string
): Promise<ApiResponse<ITutor>> => {
  const { data } = await api.patch(API_ENDPOINTS.TUTORS_TIER_APPROVE(tutorId), { approve, notes });
  return data as ApiResponse<ITutor>;
};

export const submitTutorFeedback = async (
  payload: ISubmitFeedbackFormData
): Promise<ApiResponse<ITutorFeedback>> => {
  const { data } = await api.post(API_ENDPOINTS.TUTORS_FEEDBACK, payload);
  return data as ApiResponse<ITutorFeedback>;
};

export const getTutorFeedback = async (
  tutorId: string,
  query: { page?: number; limit?: number; month?: string; finalClassId?: string } = {}
): Promise<PaginatedResponse<ITutorFeedback[]>> => {
  const params = new URLSearchParams();
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));
  if (query.month) params.append('month', query.month);
  if (query.finalClassId) params.append('finalClassId', query.finalClassId);
  const { data } = await api.get(`${API_ENDPOINTS.TUTORS_FEEDBACK_GET(tutorId)}?${params.toString()}`);
  return data as PaginatedResponse<ITutorFeedback[]>;
};

export const getTutorPerformanceMetrics = async (
  tutorId: string
): Promise<ApiResponse<ITutorPerformanceMetrics>> => {
  const { data } = await api.get(API_ENDPOINTS.TUTORS_PERFORMANCE(tutorId));
  return data as ApiResponse<ITutorPerformanceMetrics>;
};

export const getCoordinatorTutors = async (
  query: { page?: number; limit?: number; tier?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}
): Promise<PaginatedResponse<ITutor[]>> => {
  const params = new URLSearchParams();
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));
  if (query.tier) params.append('tier', query.tier);
  if (query.sortBy) params.append('sortBy', query.sortBy);
  if (query.sortOrder) params.append('sortOrder', query.sortOrder);
  const { data } = await api.get(`${API_ENDPOINTS.COORDINATOR_TUTORS}?${params.toString()}`);
  return data as PaginatedResponse<ITutor[]>;
};

export default {
  getTutors,
  getTutorById,
  getTutorByUserId,
  getMyProfile,
  createTutorProfile,
  updateTutorProfile,
  deleteTutorProfile,
  uploadDocument,
  deleteDocument,
  updateVerificationStatus,
  getPendingVerifications,
  getTutorsByStatus,
  requestTierChange,
  approveTierChange,
  submitTutorFeedback,
  getTutorFeedback,
  getTutorPerformanceMetrics,
  getCoordinatorTutors,
};
