import { Injectable } from '@nestjs/common';

import { IPlanRepository } from '../../../plans/domain/ports/out/IPlanRepository';
import { PlanNotFoundException, PlanNotAvailableException } from '../../../plans/domain/exceptions/PlanExceptions';
import { Subscription } from '../../domain/entities/Subscription';
import { ActiveSubscriptionAlreadyExistsException } from '../../domain/exceptions/SubscriptionExceptions';
import {
  ICreateSubscriptionUseCase,
  CreateSubscriptionInput,
} from '../../domain/ports/in/ISubscriptionUseCase';
import { ISubscriptionRepository } from '../../domain/ports/out/ISubscriptionRepository';

@Injectable()
export class CreateSubscriptionUseCase implements ICreateSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly planRepository: IPlanRepository,
  ) {}

  async execute(input: CreateSubscriptionInput): Promise<Subscription> {
    await this.validateNoActiveSubscription(input.userId);
    await this.validatePlanAvailable(input.planId);

    const subscription = new Subscription({
      userId: input.userId,
      planId: input.planId,
      startDate: input.startDate,
      endDate: input.endDate,
    });

    return this.subscriptionRepository.save(subscription);
  }

  private async validateNoActiveSubscription(userId: number): Promise<void> {
    const active = await this.subscriptionRepository.findActiveByUserId(userId);
    if (active) {
      throw new ActiveSubscriptionAlreadyExistsException(userId);
    }
  }

  private async validatePlanAvailable(planId: number): Promise<void> {
    const plan = await this.planRepository.findById(planId);
    if (!plan) {
      throw new PlanNotFoundException(planId);
    }
    if (!plan.isAvailable()) {
      throw new PlanNotAvailableException();
    }
  }
}
