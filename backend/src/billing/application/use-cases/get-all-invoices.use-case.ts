import { Injectable } from '@nestjs/common';

import { Invoice } from '../../domain/entities/Invoice';
import { IGetAllInvoicesUseCase } from '../../domain/ports/in/IBillingUseCase';
import { IInvoiceRepository } from '../../domain/ports/out/IInvoiceRepository';

@Injectable()
export class GetAllInvoicesUseCase implements IGetAllInvoicesUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(): Promise<Invoice[]> {
    return this.invoiceRepository.findAll();
  }
}
