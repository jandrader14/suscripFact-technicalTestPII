import { Injectable } from '@nestjs/common';

import { Plan } from '../../domain/entities/Plan';
import { IGetAllPlansUseCase } from '../../domain/ports/in/IPlanUseCase';
import { IPlanRepository } from '../../domain/ports/out/IPlanRepository';

@Injectable()
export class GetAllPlansUseCase implements IGetAllPlansUseCase {
  constructor(private readonly planRepository: IPlanRepository) {}

  async execute(): Promise<Plan[]> {
    const plans = await this.planRepository.findAll();
    return plans.filter((plan) => plan.isAvailable());
  }
}
