import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { GenerateInvoiceUseCase } from '../../application/use-cases/generate-invoice.use-case';
import { GetUserInvoicesUseCase } from '../../application/use-cases/get-user-invoices.use-case';
import { PayInvoiceUseCase } from '../../application/use-cases/pay-invoice.use-case';
import { UpdateOverdueInvoicesUseCase } from '../../application/use-cases/update-overdue-invoices.use-case';
import {
  IGenerateInvoiceUseCase,
  IGetUserInvoicesUseCase,
  IPayInvoiceUseCase,
  IUpdateOverdueInvoicesUseCase,
} from '../../domain/ports/in/IBillingUseCase';
import { IInvoiceRepository } from '../../domain/ports/out/IInvoiceRepository';
import { BronzeStrategy } from '../../domain/strategies/bronze.strategy';
import { GoldStrategy } from '../../domain/strategies/gold.strategy';
import { SilverStrategy } from '../../domain/strategies/silver.strategy';
import { InvoiceOrmEntity } from '../../infrastructure/persistence/invoice.orm-entity';
import { InvoiceTypeOrmRepository } from '../../infrastructure/persistence/invoice.typeorm.repository';
import { BillingController } from './billing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceOrmEntity])],
  controllers: [BillingController],
  providers: [
    {
      provide: 'BILLING_STRATEGIES',
      useValue: [new BronzeStrategy(), new SilverStrategy(), new GoldStrategy()],
    },
    {
      provide: IInvoiceRepository,
      useClass: InvoiceTypeOrmRepository,
    },
    {
      provide: IGenerateInvoiceUseCase,
      useClass: GenerateInvoiceUseCase,
    },
    {
      provide: IPayInvoiceUseCase,
      useClass: PayInvoiceUseCase,
    },
    {
      provide: IGetUserInvoicesUseCase,
      useClass: GetUserInvoicesUseCase,
    },
    {
      provide: IUpdateOverdueInvoicesUseCase,
      useClass: UpdateOverdueInvoicesUseCase,
    },
  ],
})
export class BillingModule {}
