import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserOrmEntity } from '../../../auth/infrastructure/persistence/user.orm-entity';
import { PlanOrmEntity } from '../../../plans/infrastructure/persistence/plan.orm-entity';

export enum SubscriptionStatusOrm {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

@Entity('subscriptions')
export class SubscriptionOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  planId: number;

  @ManyToOne(() => UserOrmEntity, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserOrmEntity;

  @ManyToOne(() => PlanOrmEntity, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'planId' })
  plan: PlanOrmEntity;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'enum', enum: SubscriptionStatusOrm, default: SubscriptionStatusOrm.ACTIVE })
  status: SubscriptionStatusOrm;

  @CreateDateColumn()
  createdAt: Date;
}
