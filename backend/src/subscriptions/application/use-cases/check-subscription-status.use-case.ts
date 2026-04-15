import { Injectable } from '@nestjs/common';

import { Subscription, SubscriptionStatus } from '../../domain/entities/Subscription';
import {
  ICheckSubscriptionStatusUseCase,
  SubscriptionStatusResult,
} from '../../domain/ports/in/ISubscriptionUseCase';
import { ISubscriptionRepository } from '../../domain/ports/out/ISubscriptionRepository';

@Injectable()
export class CheckSubscriptionStatusUseCase implements ICheckSubscriptionStatusUseCase {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(userId: number): Promise<SubscriptionStatusResult> {
    const subscription = await this.subscriptionRepository.findActiveByUserId(userId);

    if (!subscription) {
      return { isActive: false, subscription: null };
    }

    if (subscription.isExpired()) {
      const expired = new Subscription({
        id: subscription.id,
        userId: subscription.userId,
        planId: subscription.planId,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        status: SubscriptionStatus.EXPIRED,
        createdAt: subscription.createdAt,
      });
      const updated = await this.subscriptionRepository.update(expired);
      return { isActive: false, subscription: updated };
    }

    return { isActive: true, subscription };
  }
}
