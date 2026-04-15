import api from './api';
import type {
  CreatePlanPayload,
  Plan,
  UpdatePlanPayload,
} from '../types/plan.types';

export const plansService = {
  getAll: (): Promise<Plan[]> =>
    api.get<Plan[]>('/plans').then((r) => r.data),

  create: (payload: CreatePlanPayload): Promise<Plan> =>
    api.post<Plan>('/plans', payload).then((r) => r.data),

  update: (id: number, payload: UpdatePlanPayload): Promise<Plan> =>
    api.put<Plan>(`/plans/${id}`, payload).then((r) => r.data),

  remove: (id: number): Promise<void> =>
    api.delete(`/plans/${id}`).then(() => undefined),
};
