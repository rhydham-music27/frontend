import api from './api';
import { API_ENDPOINTS } from '../constants';
import { ApiResponse, PaginatedResponse, INotification } from '../types';

export type GetNotificationsQuery = {
  page?: number;
  limit?: number;
  isRead?: boolean;
};

export const getNotifications = async (
  query: GetNotificationsQuery = {}
): Promise<PaginatedResponse<INotification[]>> => {
  const params = new URLSearchParams();
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));
  if (query.isRead !== undefined) params.append('isRead', String(query.isRead));
  const url = `${API_ENDPOINTS.NOTIFICATIONS}?${params.toString()}`;
  const { data } = await api.get(url);
  return data as PaginatedResponse<INotification[]>;
};

export const getUnreadCount = async (): Promise<ApiResponse<{ count: number }>> => {
  const { data } = await api.get(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
  return data as ApiResponse<{ count: number }>;
};

export const markAsRead = async (
  notificationId: string
): Promise<ApiResponse<INotification>> => {
  const { data } = await api.patch(`${API_ENDPOINTS.NOTIFICATIONS_MARK_READ(notificationId)}`);
  return data as ApiResponse<INotification>;
};

export const markAllAsRead = async (): Promise<ApiResponse<{ modifiedCount: number }>> => {
  const { data } = await api.patch(API_ENDPOINTS.NOTIFICATIONS_MARK_ALL_READ);
  return data as ApiResponse<{ modifiedCount: number }>;
};

export const deleteNotification = async (
  notificationId: string
): Promise<ApiResponse<null>> => {
  const { data } = await api.delete(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`);
  return data as ApiResponse<null>;
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
