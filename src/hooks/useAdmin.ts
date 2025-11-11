import { useEffect, useRef, useState, useCallback } from 'react';
import { getMyProfile, getSystemWideAnalytics, exportAnalyticsCSV, exportAnalyticsPDF } from '../services/adminService';
import { IAdmin, IAdminAnalytics as AdminAnalyticsType } from '../types';

export type AdminDateRange = { fromDate?: string; toDate?: string };

const useAdmin = (
  dateRange?: AdminDateRange,
  autoRefresh: boolean = false,
  refreshInterval: number = 30000
) => {
  // Profile state
  const [adminProfile, setAdminProfile] = useState<IAdmin | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Analytics state
  const [analytics, setAnalytics] = useState<AdminAnalyticsType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-refresh timer
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch admin profile
  const fetchAdminProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      const res = await getMyProfile();
      setAdminProfile(res.data);
    } catch (e: any) {
      setProfileError(e?.response?.data?.message || 'Failed to load admin profile');
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const from = dateRange?.fromDate;
      const to = dateRange?.toDate;
      const res = await getSystemWideAnalytics(from, to);
      setAnalytics(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  }, [dateRange?.fromDate, dateRange?.toDate]);

  // Initial load effects
  useEffect(() => {
    fetchAdminProfile();
  }, [fetchAdminProfile]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      return;
    }
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      fetchAnalytics();
    }, refreshInterval);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [autoRefresh, refreshInterval, fetchAnalytics]);

  // Manual refetchers
  const refetch = fetchAnalytics;
  const refetchProfile = fetchAdminProfile;

  // Export functions
  const exportCSV = useCallback(async (reportType: string) => {
    const from = dateRange?.fromDate;
    const to = dateRange?.toDate;
    const blob = await exportAnalyticsCSV(reportType, from, to);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-analytics-${reportType}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }, [dateRange?.fromDate, dateRange?.toDate]);

  const exportPDF = useCallback(async (reportType: string) => {
    const from = dateRange?.fromDate;
    const to = dateRange?.toDate;
    const blob = await exportAnalyticsPDF(reportType, from, to);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-analytics-${reportType}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }, [dateRange?.fromDate, dateRange?.toDate]);

  return {
    // Profile
    adminProfile,
    profileLoading,
    profileError,
    // Analytics
    analytics,
    loading,
    error,
    // Refetchers
    refetch,
    refetchProfile,
    // Exporters
    exportCSV,
    exportPDF,
  };
};

export default useAdmin;
