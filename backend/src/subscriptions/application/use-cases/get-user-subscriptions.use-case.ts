import { Injectable } from '@nestjs/common';

import { Subscription } from '../../domain/entities/Subscription';
import { IGetUserSubscriptionsUseCase } from '../../domain/ports/in/ISubscriptionUseCase';
import { ISubscriptionRepository } from '../../domain/ports/out/ISubscriptionRepository';

@Injectable()
export class GetUserSubscriptionsUseCase implements IGetUserSubscriptionsUseCase {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
  ) {}

  async execute(userId: number): Promise<Subscription[]> {
    return this.subscriptionRepository.findByUserId(userId);
  }
}
