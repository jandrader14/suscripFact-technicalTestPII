import { Injectable } from '@nestjs/common';

import { IUpdateOverdueInvoicesUseCase } from '../../domain/ports/in/IBillingUseCase';
import { IInvoiceRepository } from '../../domain/ports/out/IInvoiceRepository';

@Injectable()
export class UpdateOverdueInvoicesUseCase implements IUpdateOverdueInvoicesUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(): Promise<void> {
    const pending = await this.invoiceRepository.findPendingInvoices();
    const overdue = pending.filter((invoice) => invoice.isOverdue());

    await Promise.all(
      overdue.map((invoice) =>
        this.invoiceRepository.update(invoice.markAsOverdue()),
      ),
    );
  }
}
