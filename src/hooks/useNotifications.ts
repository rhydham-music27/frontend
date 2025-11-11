import { useEffect, useState, useCallback } from 'react';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notificationService';
import { INotification, PaginatedResponse } from '../types';

export type NotificationsFilters = {
  page?: number;
  limit?: number;
  isRead?: boolean;
  enabled?: boolean;
};

const useNotifications = (filters: NotificationsFilters = {}) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setNotifications([]);
      setPagination({ page: 1, limit: 20, total: 0, pages: 0 });
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res: PaginatedResponse<INotification[]> = await getNotifications({
        page: filters.page,
        limit: filters.limit,
        isRead: filters.isRead,
      });
      setNotifications(res.data);
      setPagination(res.pagination);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit, filters.isRead]);

  const fetchUnread = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data.count);
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (filters.enabled === false) return;
    fetchNotifications();
    fetchUnread();
  }, [fetchNotifications, fetchUnread, filters.enabled]);

  const refetch = async () => {
    if (filters.enabled === false) return;
    await fetchNotifications();
    await fetchUnread();
  };

  const markRead = async (notificationId: string) => {
    await markAsRead(notificationId);
    setUnreadCount((c) => Math.max(0, c - 1));
    await refetch();
  };

  const markAll = async () => {
    await markAllAsRead();
    setUnreadCount(0);
    await refetch();
  };

  const remove = async (notificationId: string) => {
    await deleteNotification(notificationId);
    await refetch();
  };

  return {
    notifications,
    loading,
    error,
    pagination,
    unreadCount,
    refetch,
    markRead,
    markAllRead: markAll,
    deleteNotif: remove,
  };
};

export default useNotifications;
