import { Injectable } from '@nestjs/common';

import { SubscriptionStatus } from '../../domain/entities/Subscription';
import {
  IGetSubscriptionMetricsUseCase,
  SubscriptionMetrics,
} from '../../domain/ports/in/ISubscriptionUseCase';
import { ISubscriptionRepository } from '../../domain/ports/out/ISubscriptionRepository';

@Injectable()
export class GetSubscriptionMetricsUseCase implements IGetSubscriptionMetricsUseCase {
  constructor(private readonly subscriptionRepository: ISubscriptionRepository) {}

  async execute(): Promise<SubscriptionMetrics> {
    const all = await this.subscriptionRepository.findAll();

    return {
      active: all.filter((s) => s.status === SubscriptionStatus.ACTIVE).length,
      expired: all.filter((s) => s.status === SubscriptionStatus.EXPIRED).length,
      cancelled: all.filter((s) => s.status === SubscriptionStatus.CANCELLED).length,
      total: all.length,
    };
  }
}
