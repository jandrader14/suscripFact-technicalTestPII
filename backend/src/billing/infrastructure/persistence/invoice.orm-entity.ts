import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { UserOrmEntity } from '../../../auth/infrastructure/persistence/user.orm-entity';
import { SubscriptionOrmEntity } from '../../../subscriptions/infrastructure/persistence/subscription.orm-entity';

export enum InvoiceStatusOrm {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

@Entity('invoices')
export class InvoiceOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  subscriptionId: number;

  @Column()
  userId: number;

  @ManyToOne(() => SubscriptionOrmEntity, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscriptionId' })
  subscription: SubscriptionOrmEntity;

  @ManyToOne(() => UserOrmEntity, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserOrmEntity;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: InvoiceStatusOrm, default: InvoiceStatusOrm.PENDING })
  status: InvoiceStatusOrm;

  @Column({ type: 'timestamp' })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
