import api from './api';
import type {
  CreateSubscriptionPayload,
  Subscription,
  SubscriptionMetrics,
  SubscriptionStatusResult,
} from '../types/subscription.types';

export const subscriptionsService = {
  create: (payload: CreateSubscriptionPayload): Promise<Subscription> =>
    api.post<Subscription>('/subscriptions', payload).then((r) => r.data),

  getByUser: (userId: number): Promise<Subscription[]> =>
    api.get<Subscription[]>(`/subscriptions/user/${userId}`).then((r) => r.data),

  getStatus: (userId: number): Promise<SubscriptionStatusResult> =>
    api
      .get<SubscriptionStatusResult>(`/subscriptions/status/${userId}`)
      .then((r) => r.data),

  getAll: (): Promise<Subscription[]> =>
    api.get<Subscription[]>('/subscriptions/all').then((r) => r.data),

  getMetrics: (): Promise<SubscriptionMetrics> =>
    api.get<SubscriptionMetrics>('/subscriptions/metrics').then((r) => r.data),

  toggle: (subscriptionId: number): Promise<Subscription> =>
    api.patch<Subscription>(`/subscriptions/${subscriptionId}/toggle`).then((r) => r.data),
};
