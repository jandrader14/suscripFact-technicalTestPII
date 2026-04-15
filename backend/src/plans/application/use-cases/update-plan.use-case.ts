import { Injectable } from '@nestjs/common';

import { Plan } from '../../domain/entities/Plan';
import { PlanNotFoundException } from '../../domain/exceptions/PlanExceptions';
import { IUpdatePlanUseCase, UpdatePlanInput } from '../../domain/ports/in/IPlanUseCase';
import { IPlanRepository } from '../../domain/ports/out/IPlanRepository';

@Injectable()
export class UpdatePlanUseCase implements IUpdatePlanUseCase {
  constructor(private readonly planRepository: IPlanRepository) {}

  async execute(id: number, input: UpdatePlanInput): Promise<Plan> {
    const existing = await this.planRepository.findById(id);
    if (!existing) {
      throw new PlanNotFoundException(id);
    }

    const updated = new Plan({
      id: existing.id,
      name: input.name ?? existing.name,
      type: existing.type,
      price: input.price ?? existing.price,
      description: input.description ?? existing.description,
      maxUsers: input.maxUsers ?? existing.maxUsers,
      isActive: input.isActive ?? existing.isActive,
      createdAt: existing.createdAt,
    });

    return this.planRepository.update(updated);
  }
}
