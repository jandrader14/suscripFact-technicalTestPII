import { Injectable } from '@nestjs/common';

import { Subscription, SubscriptionStatus } from '../../domain/entities/Subscription';
import { SubscriptionNotFoundException } from '../../domain/exceptions/SubscriptionExceptions';
import { IToggleSubscriptionStatusUseCase } from '../../domain/ports/in/ISubscriptionUseCase';
import { ISubscriptionRepository } from '../../domain/ports/out/ISubscriptionRepository';

@Injectable()
export class ToggleSubscriptionStatusUseCase implements IToggleSubscriptionStatusUseCase {
  constructor(private readonly subscriptionRepository: ISubscriptionRepository) {}

  async execute(id: number): Promise<Subscription> {
    const sub = await this.subscriptionRepository.findById(id);
    if (!sub) throw new SubscriptionNotFoundException(id);

    const newStatus =
      sub.status === SubscriptionStatus.ACTIVE
        ? SubscriptionStatus.CANCELLED
        : SubscriptionStatus.ACTIVE;

    const updated = new Subscription({
      id: sub.id,
      userId: sub.userId,
      planId: sub.planId,
      startDate: sub.startDate,
      endDate: sub.endDate,
      status: newStatus,
      createdAt: sub.createdAt,
    });

    return this.subscriptionRepository.update(updated);
  }
}
