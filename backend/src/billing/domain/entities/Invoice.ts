export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export interface InvoiceProps {
  id?: number;
  subscriptionId: number;
  userId: number;
  amount: number;
  status?: InvoiceStatus;
  dueDate: Date;
  paidAt?: Date;
  createdAt?: Date;
}

export class Invoice {
  readonly id: number | undefined;
  readonly subscriptionId: number;
  readonly userId: number;
  readonly amount: number;
  readonly status: InvoiceStatus;
  readonly dueDate: Date;
  readonly paidAt: Date | undefined;
  readonly createdAt: Date;

  constructor(props: InvoiceProps) {
    this.id = props.id;
    this.subscriptionId = props.subscriptionId;
    this.userId = props.userId;
    this.amount = props.amount;
    this.status = props.status ?? InvoiceStatus.PENDING;
    this.dueDate = props.dueDate;
    this.paidAt = props.paidAt;
    this.createdAt = props.createdAt ?? new Date();
  }

  markAsPaid(): Invoice {
    return new Invoice({
      id: this.id,
      subscriptionId: this.subscriptionId,
      userId: this.userId,
      amount: this.amount,
      status: InvoiceStatus.PAID,
      dueDate: this.dueDate,
      paidAt: new Date(),
      createdAt: this.createdAt,
    });
  }

  markAsOverdue(): Invoice {
    return new Invoice({
      id: this.id,
      subscriptionId: this.subscriptionId,
      userId: this.userId,
      amount: this.amount,
      status: InvoiceStatus.OVERDUE,
      dueDate: this.dueDate,
      paidAt: this.paidAt,
      createdAt: this.createdAt,
    });
  }

  isPending(): boolean {
    return this.status === InvoiceStatus.PENDING;
  }

  isOverdue(): boolean {
    return this.isPending() && new Date() > this.dueDate;
  }
}
