import api from './api';

export interface IClassPlan {
  id: string;
  classId: string;
  parentId?: string;
  currentTutorId?: string;
  monthlyFee: number;
  sessionsPerMonth: number;
  perSessionFee: number;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

interface CreatePlanData {
  classId: string;
  monthlyFee: number;
  sessionsPerMonth: number;
  status?: 'ACTIVE' | 'PAUSED';
}

const getPlanByClassId = async (classId: string) => {
  const response = await api.get<{ success: boolean; data: IClassPlan | null }>(`/api/class-plans/${classId}`);
  return response.data;
};

const createOrUpdatePlan = async (data: CreatePlanData) => {
  const response = await api.post<{ success: boolean; data: IClassPlan }>('/api/class-plans', data);
  return response.data;
};

const updatePlan = async (id: string, data: Partial<CreatePlanData>) => {
  const response = await api.patch<{ success: boolean; data: IClassPlan }>(`/api/class-plans/plan/${id}`, data);
  return response.data;
};

const classPlanService = {
  getPlanByClassId,
  createOrUpdatePlan,
  updatePlan,
};

export default classPlanService;
