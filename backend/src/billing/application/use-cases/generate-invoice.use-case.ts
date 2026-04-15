import { Inject, Injectable } from '@nestjs/common';

import { IBillingStrategy } from '../../domain/strategies/billing-strategy.interface';
import { Invoice } from '../../domain/entities/Invoice';
import { InvalidBillingStrategyException } from '../../domain/exceptions/BillingExceptions';
import { IGenerateInvoiceUseCase, GenerateInvoiceInput } from '../../domain/ports/in/IBillingUseCase';
import { IInvoiceRepository } from '../../domain/ports/out/IInvoiceRepository';

@Injectable()
export class GenerateInvoiceUseCase implements IGenerateInvoiceUseCase {
  private readonly strategies: Map<string, IBillingStrategy>;

  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    @Inject('BILLING_STRATEGIES') strategies: IBillingStrategy[],
  ) {
    this.strategies = new Map(
      strategies.map((s) => [s.getPlanType(), s]),
    );
  }

  async execute(input: GenerateInvoiceInput): Promise<Invoice> {
    const strategy = this.strategies.get(input.planType);
    if (!strategy) {
      throw new InvalidBillingStrategyException(input.planType);
    }

    const amount = strategy.calculateAmount(
      input.planPrice,
      input.startDate,
      input.endDate,
      input.maxUsers,
    );

    const invoice = new Invoice({
      subscriptionId: input.subscriptionId,
      userId: input.userId,
      amount,
      dueDate: input.dueDate,
    });

    return this.invoiceRepository.save(invoice);
  }
}
