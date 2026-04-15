import { Injectable } from '@nestjs/common';

import { Invoice } from '../../domain/entities/Invoice';
import { IGetUserInvoicesUseCase } from '../../domain/ports/in/IBillingUseCase';
import { IInvoiceRepository } from '../../domain/ports/out/IInvoiceRepository';

@Injectable()
export class GetUserInvoicesUseCase implements IGetUserInvoicesUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(userId: number): Promise<Invoice[]> {
    return this.invoiceRepository.findByUserId(userId);
  }
}
