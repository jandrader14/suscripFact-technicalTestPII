import { Injectable } from '@nestjs/common';

import { Plan } from '../../domain/entities/Plan';
import { PlanAlreadyExistsException } from '../../domain/exceptions/PlanExceptions';
import {
  ICreatePlanUseCase,
  CreatePlanInput,
} from '../../domain/ports/in/IPlanUseCase';
import { IPlanRepository } from '../../domain/ports/out/IPlanRepository';

@Injectable()
export class CreatePlanUseCase implements ICreatePlanUseCase {
  constructor(private readonly planRepository: IPlanRepository) {}

  async execute(input: CreatePlanInput): Promise<Plan> {
    await this.validateTypeNotTaken(input.type);

    const plan = new Plan({
      name: input.name,
      type: input.type,
      price: input.price,
      description: input.description,
      maxUsers: input.maxUsers,
    });

    return this.planRepository.save(plan);
  }

  private async validateTypeNotTaken(type: string): Promise<void> {
    const existing = await this.planRepository.findByType(type as never);
    if (existing) {
      throw new PlanAlreadyExistsException(type);
    }
  }
}
