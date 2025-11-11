import api from './api';
import { API_ENDPOINTS } from '../constants';
import { PaginatedResponse, IFinalClass } from '../types';

export const getMyClasses = async (
  status?: string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<IFinalClass[]>> => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  params.append('page', String(page));
  params.append('limit', String(limit));
  const url = `${API_ENDPOINTS.FINAL_CLASSES_MY_CLASSES}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as PaginatedResponse<IFinalClass[]>;
};

export default { getMyClasses };
