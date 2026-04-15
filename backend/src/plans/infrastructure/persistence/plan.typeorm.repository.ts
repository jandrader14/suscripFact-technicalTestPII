import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Plan, PlanType } from '../../domain/entities/Plan';
import { IPlanRepository } from '../../domain/ports/out/IPlanRepository';
import { PlanOrmEntity, PlanTypeOrm } from './plan.orm-entity';

class PlanMapper {
  static toDomain(orm: PlanOrmEntity): Plan {
    return new Plan({
      id: orm.id,
      name: orm.name,
      type: orm.type as unknown as PlanType,
      price: Number(orm.price),
      description: orm.description,
      maxUsers: orm.maxUsers,
      isActive: orm.isActive,
      createdAt: orm.createdAt,
    });
  }

  static toPersistence(plan: Plan): Partial<PlanOrmEntity> {
    return {
      ...(plan.id !== undefined && { id: plan.id }),
      name: plan.name,
      type: plan.type as unknown as PlanTypeOrm,
      price: plan.price,
      description: plan.description,
      maxUsers: plan.maxUsers,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
    };
  }
}

@Injectable()
export class PlanTypeOrmRepository implements IPlanRepository {
  constructor(
    @InjectRepository(PlanOrmEntity)
    private readonly repo: Repository<PlanOrmEntity>,
  ) {}

  async save(plan: Plan): Promise<Plan> {
    const orm = this.repo.create(PlanMapper.toPersistence(plan));
    const saved = await this.repo.save(orm);
    return PlanMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Plan | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? PlanMapper.toDomain(orm) : null;
  }

  async findAll(): Promise<Plan[]> {
    const orms = await this.repo.find();
    return orms.map(PlanMapper.toDomain);
  }

  async findByType(type: PlanType): Promise<Plan | null> {
    const orm = await this.repo.findOne({
      where: { type: type as unknown as PlanTypeOrm },
    });
    return orm ? PlanMapper.toDomain(orm) : null;
  }

  async update(plan: Plan): Promise<Plan> {
    const orm = this.repo.create(PlanMapper.toPersistence(plan));
    const saved = await this.repo.save(orm);
    return PlanMapper.toDomain(saved);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
