import api from './api';

export interface SubjectOption {
  _id: string;
  name: string;
  code?: string;
}

export const getSubjects = async (): Promise<SubjectOption[]> => {
  const res = await api.get('/subjects');
  const data = (res.data?.data || []) as any[];
  return data.map((s) => ({
    _id: String(s._id),
    name: s.name as string,
    code: s.code as string | undefined,
  }));
};
