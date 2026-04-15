import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Subscription, SubscriptionStatus } from '../../domain/entities/Subscription';
import { ISubscriptionRepository } from '../../domain/ports/out/ISubscriptionRepository';
import { SubscriptionOrmEntity, SubscriptionStatusOrm } from './subscription.orm-entity';

class SubscriptionMapper {
  static toDomain(orm: SubscriptionOrmEntity): Subscription {
    return new Subscription({
      id: orm.id,
      userId: orm.userId,
      planId: orm.planId,
      startDate: orm.startDate,
      endDate: orm.endDate,
      status: orm.status as unknown as SubscriptionStatus,
      createdAt: orm.createdAt,
    });
  }

  static toPersistence(subscription: Subscription): Partial<SubscriptionOrmEntity> {
    return {
      ...(subscription.id !== undefined && { id: subscription.id }),
      userId: subscription.userId,
      planId: subscription.planId,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      status: subscription.status as unknown as SubscriptionStatusOrm,
      createdAt: subscription.createdAt,
    };
  }
}

@Injectable()
export class SubscriptionTypeOrmRepository implements ISubscriptionRepository {
  constructor(
    @InjectRepository(SubscriptionOrmEntity)
    private readonly repo: Repository<SubscriptionOrmEntity>,
  ) {}

  async save(subscription: Subscription): Promise<Subscription> {
    const orm = this.repo.create(SubscriptionMapper.toPersistence(subscription));
    const saved = await this.repo.save(orm);
    return SubscriptionMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Subscription | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? SubscriptionMapper.toDomain(orm) : null;
  }

  async findByUserId(userId: number): Promise<Subscription[]> {
    const orms = await this.repo.find({ where: { userId } });
    return orms.map(SubscriptionMapper.toDomain);
  }

  async findActiveByUserId(userId: number): Promise<Subscription | null> {
    const orm = await this.repo.findOne({
      where: { userId, status: SubscriptionStatusOrm.ACTIVE },
    });
    return orm ? SubscriptionMapper.toDomain(orm) : null;
  }

  async update(subscription: Subscription): Promise<Subscription> {
    const orm = this.repo.create(SubscriptionMapper.toPersistence(subscription));
    const saved = await this.repo.save(orm);
    return SubscriptionMapper.toDomain(saved);
  }

  async findAll(): Promise<Subscription[]> {
    const orms = await this.repo.find({ order: { createdAt: 'DESC' } });
    return orms.map(SubscriptionMapper.toDomain);
  }
}
