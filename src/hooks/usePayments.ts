import { useEffect, useState, useCallback } from 'react';
import {
  getPayments,
  updatePayment,
  deletePayment,
  updatePaymentStatus,
  getPaymentStatistics,
} from '../services/paymentService';
import { IPayment, IPaymentStatistics, PaginatedResponse } from '../types';

export type PaymentsFilters = {
  page?: number;
  limit?: number;
  status?: string;
  tutorId?: string;
  finalClassId?: string;
  fromDate?: string;
  toDate?: string;
};

const usePayments = (filters: PaymentsFilters = {}) => {
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [statistics, setStatistics] = useState<IPaymentStatistics | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res: PaginatedResponse<IPayment[]> = await getPayments({
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
        tutorId: filters.tutorId,
        finalClassId: filters.finalClassId,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
      });
      setPayments(res.data);
      setPagination(res.pagination);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.limit, filters.status, filters.tutorId, filters.finalClassId, filters.fromDate, filters.toDate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const refetch = fetchPayments;

  const updateStatus = async (
    paymentId: string,
    payload: { status: string; paymentMethod?: string; transactionId?: string; notes?: string }
  ) => {
    const res = await updatePaymentStatus(paymentId, payload);
    await refetch();
    return res;
  };

  const updatePaymentRecord = async (
    paymentId: string,
    payload: Partial<{ amount: number; dueDate: string; notes: string }>
  ) => {
    const res = await updatePayment(paymentId, payload);
    await refetch();
    return res;
  };

  const deletePaymentRecord = async (paymentId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this payment?');
    if (!confirmed) return;
    const res = await deletePayment(paymentId);
    await refetch();
    return res;
  };

  const fetchStatistics = async (
    options: { fromDate?: string; toDate?: string; tutorId?: string } = {}
  ) => {
    const res = await getPaymentStatistics(options);
    setStatistics(res.data);
    return res;
  };

  return {
    payments,
    loading,
    error,
    pagination,
    statistics,
    refetch,
    updateStatus,
    updatePaymentRecord,
    deletePaymentRecord,
    fetchStatistics,
  };
};

export default usePayments;
