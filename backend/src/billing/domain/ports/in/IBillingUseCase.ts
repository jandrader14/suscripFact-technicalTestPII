import { Invoice } from '../../entities/Invoice';

export interface GenerateInvoiceInput {
  subscriptionId: number;
  userId: number;
  planType: string;
  planPrice: number;
  maxUsers?: number;
  startDate: Date;
  endDate: Date;
  dueDate: Date;
}

export abstract class IGenerateInvoiceUseCase {
  abstract execute(input: GenerateInvoiceInput): Promise<Invoice>;
}

export abstract class IPayInvoiceUseCase {
  abstract execute(invoiceId: number): Promise<Invoice>;
}

export abstract class IGetUserInvoicesUseCase {
  abstract execute(userId: number): Promise<Invoice[]>;
}

export abstract class IUpdateOverdueInvoicesUseCase {
  abstract execute(): Promise<void>;
}
