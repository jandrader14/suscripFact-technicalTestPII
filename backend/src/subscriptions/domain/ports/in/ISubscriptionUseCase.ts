import { Subscription } from '../../entities/Subscription';

export interface CreateSubscriptionInput {
  userId: number;
  planId: number;
  startDate: Date;
  endDate: Date;
}

export interface SubscriptionStatusResult {
  isActive: boolean;
  subscription: Subscription | null;
}

export abstract class ICreateSubscriptionUseCase {
  abstract execute(input: CreateSubscriptionInput): Promise<Subscription>;
}

export abstract class IGetUserSubscriptionsUseCase {
  abstract execute(userId: number): Promise<Subscription[]>;
}

export abstract class ICheckSubscriptionStatusUseCase {
  abstract execute(userId: number): Promise<SubscriptionStatusResult>;
}

export abstract class IGetAllSubscriptionsUseCase {
  abstract execute(): Promise<Subscription[]>;
}

export abstract class IToggleSubscriptionStatusUseCase {
  abstract execute(id: number): Promise<Subscription>;
}

export interface SubscriptionMetrics {
  active: number;
  expired: number;
  cancelled: number;
  total: number;
}

export abstract class IGetSubscriptionMetricsUseCase {
  abstract execute(): Promise<SubscriptionMetrics>;
}
