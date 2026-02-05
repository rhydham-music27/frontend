import api from './api';
import { API_ENDPOINTS } from '../constants';
import { ApiResponse, PaginatedResponse, ITest, ITestReport, IScheduleTestFormData } from '../types';

export type GetTestsQuery = {
  page?: number;
  limit?: number;
  finalClassId?: string;
  status?: string;
  tutorId?: string;
  coordinatorId?: string;
  fromDate?: string;
  toDate?: string;
};

export const getTests = async (query: GetTestsQuery = {}): Promise<PaginatedResponse<ITest[]>> => {
  const params = new URLSearchParams();
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));
  if (query.finalClassId) params.append('finalClassId', query.finalClassId);
  if (query.status) params.append('status', query.status);
  if (query.tutorId) params.append('tutorId', query.tutorId);
  if (query.coordinatorId) params.append('coordinatorId', query.coordinatorId);
  if (query.fromDate) params.append('fromDate', query.fromDate);
  if (query.toDate) params.append('toDate', query.toDate);
  const { data } = await api.get(`${API_ENDPOINTS.TESTS}?${params.toString()}`);
  return data as PaginatedResponse<ITest[]>;
};

export const getTestById = async (testId: string): Promise<ApiResponse<ITest>> => {
  const { data } = await api.get(`${API_ENDPOINTS.TESTS}/${testId}`);
  return data as ApiResponse<ITest>;
};

export const uploadTestAnswerSheet = async (
  testId: string,
  file: File,
  options: { topicName?: string; totalMarks?: number; obtainedMarks?: number }
): Promise<ApiResponse<ITest>> => {
  const formData = new FormData();
  formData.append('file', file);
  if (options.topicName) {
    formData.append('topicName', options.topicName);
  }
  if (typeof options.totalMarks === 'number') {
    formData.append('totalMarks', String(options.totalMarks));
  }
  if (typeof options.obtainedMarks === 'number') {
    formData.append('obtainedMarks', String(options.obtainedMarks));
  }

  const { data } = await api.post(`${API_ENDPOINTS.TESTS}/${testId}/report-file`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data as ApiResponse<ITest>;
};

export const scheduleTest = async (payload: IScheduleTestFormData): Promise<ApiResponse<ITest>> => {
  const { data } = await api.post(API_ENDPOINTS.TESTS, payload);
  return data as ApiResponse<ITest>;
};

export const updateTest = async (
  testId: string,
  update: Partial<IScheduleTestFormData>
): Promise<ApiResponse<ITest>> => {
  const { data } = await api.put(`${API_ENDPOINTS.TESTS}/${testId}`, update);
  return data as ApiResponse<ITest>;
};

export const deleteTest = async (testId: string): Promise<ApiResponse<null>> => {
  const { data } = await api.delete(`${API_ENDPOINTS.TESTS}/${testId}`);
  return data as ApiResponse<null>;
};

export const updateTestStatus = async (
  testId: string,
  status: string
): Promise<ApiResponse<ITest>> => {
  const { data } = await api.patch(API_ENDPOINTS.TESTS_STATUS(testId), { status });
  return data as ApiResponse<ITest>;
};

export const submitTestReport = async (
  testId: string,
  report: ITestReport
): Promise<ApiResponse<ITest>> => {
  const { data } = await api.patch(API_ENDPOINTS.TESTS_REPORT(testId), { report });
  return data as ApiResponse<ITest>;
};

export const cancelTest = async (
  testId: string,
  cancellationReason: string
): Promise<ApiResponse<ITest>> => {
  const { data } = await api.patch(API_ENDPOINTS.TESTS_CANCEL(testId), { cancellationReason });
  return data as ApiResponse<ITest>;
};

export const getCoordinatorTests = async (status?: string): Promise<ApiResponse<ITest[]>> => {
  const url = status ? `${API_ENDPOINTS.TESTS_COORDINATOR}?status=${encodeURIComponent(status)}` : API_ENDPOINTS.TESTS_COORDINATOR;
  const { data } = await api.get(url);
  return data as ApiResponse<ITest[]>;
};

export const getParentTests = async (): Promise<ApiResponse<ITest[]>> => {
  const { data } = await api.get(API_ENDPOINTS.TESTS_PARENT_MY_TESTS);
  return data as ApiResponse<ITest[]>;
};

export const getTestsByClass = async (
  classId: string,
  status?: string
): Promise<ApiResponse<ITest[]>> => {
  const url = status
    ? `${API_ENDPOINTS.TESTS_CLASS(classId)}?status=${encodeURIComponent(status)}`
    : API_ENDPOINTS.TESTS_CLASS(classId);
  const { data } = await api.get(url);
  return data as ApiResponse<ITest[]>;
};

export const downloadTestReportPDF = async (testId: string): Promise<Blob> => {
  const response = await api.get(API_ENDPOINTS.TESTS_EXPORT_PDF(testId), { responseType: 'blob' });
  return response.data as Blob;
};

export const uploadTestPaper = async (
  testId: string,
  file: File,
  options?: { totalMarks?: number; durationMinutes?: number }
): Promise<ApiResponse<ITest>> => {
  const formData = new FormData();
  // backend upload middleware accepts any field name and maps first file to req.file
  formData.append('file', file);
  if (options?.totalMarks != null) {
    formData.append('totalMarks', String(options.totalMarks));
  }
  if (options?.durationMinutes != null) {
    formData.append('durationMinutes', String(options.durationMinutes));
  }

  const { data } = await api.post(`${API_ENDPOINTS.TESTS}/${testId}/paper`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data as ApiResponse<ITest>;
};

export default {
  getTests,
  getTestById,
  scheduleTest,
  updateTest,
  deleteTest,
  updateTestStatus,
  submitTestReport,
  cancelTest,
  getCoordinatorTests,
  getParentTests,
  getTestsByClass,
  downloadTestReportPDF,
  uploadTestPaper,
  uploadTestAnswerSheet,
};
