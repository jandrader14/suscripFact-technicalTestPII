import { Injectable } from '@nestjs/common';

import { Subscription } from '../../domain/entities/Subscription';
import { IGetAllSubscriptionsUseCase } from '../../domain/ports/in/ISubscriptionUseCase';
import { ISubscriptionRepository } from '../../domain/ports/out/ISubscriptionRepository';

@Injectable()
export class GetAllSubscriptionsUseCase implements IGetAllSubscriptionsUseCase {
  constructor(private readonly subscriptionRepository: ISubscriptionRepository) {}

  async execute(): Promise<Subscription[]> {
    return this.subscriptionRepository.findAll();
  }
}
