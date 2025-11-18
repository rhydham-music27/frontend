import { useEffect, useState, useCallback } from 'react';
import {
  getOverallStats,
  getDateWiseLeads,
  getLeadStatusDistribution,
  getConversionFunnel,
  getClassProgress,
  getCumulativeGrowth,
  getTutorProgressReport,
  getPendingApprovals,
  getRevenueAnalytics,
  exportDashboardCSV,
  exportDashboardPDF,
} from '../services/dashboardService';
import {
  IDashboardStatistics,
  IDateWiseData,
  IStatusDistribution,
  IConversionFunnel,
  IClassProgress,
  ICumulativeGrowth,
  ITutorPerformance,
  IPendingApprovals,
  IRevenueAnalytics,
} from '../types';

export type DashboardDateRange = { fromDate?: string; toDate?: string };

const useDashboard = (
  dateRange?: DashboardDateRange,
  autoRefresh: boolean = false,
  refreshInterval: number = 30000
) => {
  const [overallStats, setOverallStats] = useState<IDashboardStatistics | null>(null);
  const [dateWiseLeads, setDateWiseLeads] = useState<IDateWiseData[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<IStatusDistribution[]>([]);
  const [conversionFunnel, setConversionFunnel] = useState<IConversionFunnel | null>(null);
  const [classProgress, setClassProgress] = useState<IClassProgress | null>(null);
  const [cumulativeGrowth, setCumulativeGrowth] = useState<ICumulativeGrowth[]>([]);
  const [tutorReport, setTutorReport] = useState<{ tutors: ITutorPerformance[]; total: number; page: number; limit: number }>({ tutors: [], total: 0, page: 1, limit: 10 });
  const [pendingApprovals, setPendingApprovals] = useState<IPendingApprovals | null>(null);
  const [revenueAnalytics, setRevenueAnalytics] = useState<IRevenueAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const from = dateRange?.fromDate;
      const to = dateRange?.toDate;

      const [statsRes, leadsRes, statusRes, funnelRes, progressRes, growthRes, pendingRes, revenueRes] = await Promise.all([
        getOverallStats(from, to),
        getDateWiseLeads(from, to, 'day'),
        getLeadStatusDistribution(from, to),
        getConversionFunnel(from, to),
        getClassProgress(from, to),
        from && to ? getCumulativeGrowth(from, to, 'day') : Promise.resolve({ success: true, data: [] }),
        getPendingApprovals(),
        getRevenueAnalytics(from, to, 'day'),
      ]);

      setOverallStats(statsRes.data);
      setDateWiseLeads(leadsRes.data);
      setStatusDistribution(statusRes.data);
      setConversionFunnel(funnelRes.data);
      setClassProgress(progressRes.data);
      setCumulativeGrowth((growthRes as any).data || []);
      setPendingApprovals(pendingRes.data);
      setRevenueAnalytics(revenueRes.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [dateRange?.fromDate, dateRange?.toDate]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      fetchAllData();
    }, refreshInterval);
    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval, fetchAllData]);

  const refetch = fetchAllData;

  const fetchTutorReport = async (
    page: number,
    limit: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ) => {
    const from = dateRange?.fromDate;
    const to = dateRange?.toDate;
    const res = await getTutorProgressReport(page, limit, sortBy, sortOrder, from, to);
    console.log('Tutor progress report response', res);
    setTutorReport({ tutors: res.data, total: res.pagination.total, page: res.pagination.page, limit: res.pagination.limit });
  };

  const exportCSV = async (reportType: string) => {
    const from = dateRange?.fromDate;
    const to = dateRange?.toDate;
    const blob = await exportDashboardCSV(reportType, from, to);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-report-${reportType}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const exportPDF = async (reportType: string) => {
    const from = dateRange?.fromDate;
    const to = dateRange?.toDate;
    const blob = await exportDashboardPDF(reportType, from, to);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-report-${reportType}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return {
    overallStats,
    dateWiseLeads,
    statusDistribution,
    conversionFunnel,
    classProgress,
    cumulativeGrowth,
    tutorReport,
    pendingApprovals,
    revenueAnalytics,
    loading,
    error,
    refetch,
    fetchTutorReport,
    exportCSV,
    exportPDF,
  };
};

export default useDashboard;
