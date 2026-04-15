export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface Subscription {
  id: number;
  userId: number;
  planId: number;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
}

export interface CreateSubscriptionPayload {
  userId: number;
  planId: number;
  startDate: string;
  endDate: string;
}

export interface SubscriptionStatusResult {
  isActive: boolean;
  subscription: Subscription | null;
}
