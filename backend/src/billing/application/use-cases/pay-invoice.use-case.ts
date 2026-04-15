import { Injectable } from '@nestjs/common';

import { Invoice } from '../../domain/entities/Invoice';
import {
  InvoiceAlreadyPaidException,
  InvoiceNotFoundException,
} from '../../domain/exceptions/BillingExceptions';
import { IPayInvoiceUseCase } from '../../domain/ports/in/IBillingUseCase';
import { IInvoiceRepository } from '../../domain/ports/out/IInvoiceRepository';

@Injectable()
export class PayInvoiceUseCase implements IPayInvoiceUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(invoiceId: number): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new InvoiceNotFoundException(invoiceId);
    }
    if (!invoice.isPending()) {
      throw new InvoiceAlreadyPaidException(invoiceId);
    }
    return this.invoiceRepository.update(invoice.markAsPaid());
  }
}
