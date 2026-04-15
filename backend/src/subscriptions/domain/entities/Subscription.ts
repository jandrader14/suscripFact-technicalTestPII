export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface SubscriptionProps {
  id?: number;
  userId: number;
  planId: number;
  startDate: Date;
  endDate: Date;
  status?: SubscriptionStatus;
  createdAt?: Date;
}

export class Subscription {
  readonly id: number | undefined;
  readonly userId: number;
  readonly planId: number;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly status: SubscriptionStatus;
  readonly createdAt: Date;

  constructor(props: SubscriptionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.planId = props.planId;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.status = props.status ?? SubscriptionStatus.ACTIVE;
    this.createdAt = props.createdAt ?? new Date();
  }

  isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE && !this.isExpired();
  }

  isExpired(): boolean {
    return new Date() > this.endDate;
  }

  daysUntilExpiration(): number {
    const ms = this.endDate.getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }
}
