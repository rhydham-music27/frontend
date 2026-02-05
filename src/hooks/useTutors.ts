import { useEffect, useState, useCallback } from 'react';
import {
  getTutors,
  updateTutorProfile,
  uploadDocument,
  deleteDocument,
  updateVerificationStatus,
} from '../services/tutorService';
import { ITutor, PaginatedResponse } from '../types';

export type TutorsFilters = {
  page?: number;
  limit?: number;
  verificationStatus?: string;
  isAvailable?: boolean;
  subjects?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  teacherId?: string;
  name?: string;
  email?: string;
  phone?: string;
  preferredMode?: string;
  verifiedBy?: string;
};

const useTutors = (filters: TutorsFilters = {}) => {
  const [tutors, setTutors] = useState<ITutor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const fetchTutors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res: PaginatedResponse<ITutor[]> = await getTutors({
        page: filters.page,
        limit: filters.limit,
        verificationStatus: filters.verificationStatus,
        isAvailable: filters.isAvailable,
        subjects: filters.subjects,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        search: filters.search,
        teacherId: filters.teacherId,
        name: filters.name,
        email: filters.email,
        phone: filters.phone,
        preferredMode: filters.preferredMode,
        verifiedBy: filters.verifiedBy,
      });
      setTutors(res.data);
      setPagination(res.pagination);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch tutors');
    } finally {
      setLoading(false);
    }
  }, [
    filters.page, 
    filters.limit, 
    filters.verificationStatus, 
    filters.isAvailable, 
    filters.sortBy,
    filters.sortOrder,
    filters.search,
    filters.teacherId,
    filters.name,
    filters.email,
    filters.phone,
    filters.preferredMode,
    filters.verifiedBy,
    JSON.stringify(filters.subjects || [])
  ]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  const refetch = fetchTutors;

  const updateVerification = async (
    tutorId: string,
    status: string,
    verificationNotes?: string
  ) => {
    const res = await updateVerificationStatus(tutorId, status, verificationNotes);
    await refetch();
    return res;
  };

  const uploadDoc = async (tutorId: string, documentType: string, file: File) => {
    const res = await uploadDocument(tutorId, documentType, file);
    await refetch();
    return res;
  };

  const deleteDoc = async (tutorId: string, documentIndex: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this document?');
    if (!confirmed) return;
    const res = await deleteDocument(tutorId, documentIndex);
    await refetch();
    return res;
  };

  const updateProfile = async (tutorId: string, data: Record<string, any>) => {
    const res = await updateTutorProfile(tutorId, data);
    await refetch();
    return res;
  };

  return { tutors, loading, error, pagination, refetch, updateVerification, uploadDoc, deleteDoc, updateProfile };
};

export default useTutors;
