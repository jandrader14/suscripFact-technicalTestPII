export type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface Invoice {
  id: number;
  subscriptionId: number;
  userId: number;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt: string | null;
}

export interface GenerateInvoicePayload {
  subscriptionId: number;
  userId: number;
  planType: string;
  planPrice: number;
  maxUsers?: number;
  startDate: string;
  endDate: string;
  dueDate: string;
}
