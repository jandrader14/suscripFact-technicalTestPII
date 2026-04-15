import api from './api';
import type{
  CreateSubscriptionPayload,
  Subscription,
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
};
