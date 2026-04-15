import api from './api';
import type { GenerateInvoicePayload, Invoice } from '../types/invoice.types';

export const billingService = {
  generate: (payload: GenerateInvoicePayload): Promise<Invoice> =>
    api.post<Invoice>('/billing/invoices', payload).then((r) => r.data),

  pay: (invoiceId: number): Promise<Invoice> =>
    api.post<Invoice>(`/billing/invoices/${invoiceId}/pay`).then((r) => r.data),

  getByUser: (userId: number): Promise<Invoice[]> =>
    api.get<Invoice[]>(`/billing/invoices/user/${userId}`).then((r) => r.data),

  updateOverdue: (): Promise<void> =>
    api.patch('/billing/invoices/overdue').then(() => undefined),
};
