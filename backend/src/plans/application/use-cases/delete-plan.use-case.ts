import { Injectable } from '@nestjs/common';

import { PlanNotFoundException } from '../../domain/exceptions/PlanExceptions';
import { IDeletePlanUseCase } from '../../domain/ports/in/IPlanUseCase';
import { IPlanRepository } from '../../domain/ports/out/IPlanRepository';

@Injectable()
export class DeletePlanUseCase implements IDeletePlanUseCase {
  constructor(private readonly planRepository: IPlanRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.planRepository.findById(id);
    if (!existing) {
      throw new PlanNotFoundException(id);
    }
    await this.planRepository.delete(id);
  }
}
