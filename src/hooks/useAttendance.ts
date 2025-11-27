import { useEffect, useState, useCallback } from 'react';
import {
  getAttendances,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  coordinatorApprove,
  parentApprove,
  rejectAttendance,
} from '../services/attendanceService';
import { IAttendance, PaginatedResponse } from '../types';

export type AttendanceFilters = {
  page?: number;
  limit?: number;
  finalClassId?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
};

const useAttendance = (filters: AttendanceFilters = {}) => {
  const [attendances, setAttendances] = useState<IAttendance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const fetchAttendances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res: PaginatedResponse<IAttendance[]> = await getAttendances({
        page: filters.page,
        limit: filters.limit,
        finalClassId: filters.finalClassId,
        status: filters.status,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
      setAttendances(res.data);
      setPagination(res.pagination);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch attendances');
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit, filters.finalClassId, filters.status, filters.fromDate, filters.toDate]);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  const refetch = fetchAttendances;

  const createAttendanceRecord = async (
    payload: { finalClassId: string; sessionDate: string; topicCovered?: string; notes?: string }
  ) => {
    const res = await createAttendance(payload);
    await refetch();
    return res;
  };

  const approveAsCoordinator = async (attendanceId: string) => {
    const res = await coordinatorApprove(attendanceId);
    await refetch();
    return res;
  };

  const approveAsParent = async (attendanceId: string) => {
    const res = await parentApprove(attendanceId);
    await refetch();
    return res;
  };

  const rejectRecord = async (attendanceId: string, reason: string) => {
    const confirmed = window.confirm('Are you sure you want to reject this attendance?');
    if (!confirmed) return;
    const res = await rejectAttendance(attendanceId, reason);
    await refetch();
    return res;
  };

  const updateRecord = async (
    attendanceId: string,
    data: Partial<{ sessionDate: string; topicCovered: string; notes: string; status: string }>
  ) => {
    const res = await updateAttendance(attendanceId, data);
    await refetch();
    return res;
  };

  const deleteRecord = async (attendanceId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this record?');
    if (!confirmed) return;
    const res = await deleteAttendance(attendanceId);
    await refetch();
    return res;
  };

  return {
    attendances,
    loading,
    error,
    pagination,
    refetch,
    createAttendanceRecord,
    approveAsCoordinator,
    approveAsParent,
    rejectRecord,
    updateRecord,
    deleteRecord,
  };
};

export default useAttendance;
