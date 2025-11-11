import { useEffect, useState, useCallback } from 'react';
import { getDashboardStats, getTodaysTasks } from '../services/coordinatorService';
import { ICoordinatorDashboardStats, ICoordinatorTodaysTasks } from '../types';

const useCoordinator = () => {
  const [dashboardStats, setDashboardStats] = useState<ICoordinatorDashboardStats | null>(null);
  const [todaysTasks, setTodaysTasks] = useState<ICoordinatorTodaysTasks | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, tasksRes] = await Promise.all([getDashboardStats(), getTodaysTasks()]);
      setDashboardStats(statsRes.data);
      setTodaysTasks(tasksRes.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load coordinator dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refetch = fetchDashboardData;

  return { dashboardStats, todaysTasks, loading, error, refetch };
};

export default useCoordinator;
