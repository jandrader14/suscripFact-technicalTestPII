import { Injectable } from '@nestjs/common';

import { Plan } from '../../domain/entities/Plan';
import { PlanNotFoundException } from '../../domain/exceptions/PlanExceptions';
import { IGetPlanByIdUseCase } from '../../domain/ports/in/IPlanUseCase';
import { IPlanRepository } from '../../domain/ports/out/IPlanRepository';

@Injectable()
export class GetPlanByIdUseCase implements IGetPlanByIdUseCase {
  constructor(private readonly planRepository: IPlanRepository) {}

  async execute(id: number): Promise<Plan> {
    const plan = await this.planRepository.findById(id);
    if (!plan) {
      throw new PlanNotFoundException(id);
    }
    return plan;
  }
}
