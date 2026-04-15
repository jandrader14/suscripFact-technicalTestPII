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
