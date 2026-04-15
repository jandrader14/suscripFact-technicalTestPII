export type PlanType = 'BRONZE' | 'SILVER' | 'GOLD';

export interface Plan {
  id: number;
  name: string;
  type: PlanType;
  price: number;
  description: string;
  maxUsers: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreatePlanPayload {
  name: string;
  type: PlanType;
  price: number;
  description: string;
  maxUsers: number;
}

export interface UpdatePlanPayload {
  name?: string;
  price?: number;
  description?: string;
  maxUsers?: number;
  isActive?: boolean;
}
