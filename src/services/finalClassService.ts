import api from './api';
import { API_ENDPOINTS } from '../constants';
import { PaginatedResponse, IFinalClass } from '../types';

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

export default { getMyClasses };
