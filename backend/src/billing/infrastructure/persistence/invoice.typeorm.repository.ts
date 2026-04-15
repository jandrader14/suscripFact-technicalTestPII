import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invoice, InvoiceStatus } from '../../domain/entities/Invoice';
import { IInvoiceRepository } from '../../domain/ports/out/IInvoiceRepository';
import { InvoiceOrmEntity, InvoiceStatusOrm } from './invoice.orm-entity';

class InvoiceMapper {
  static toDomain(orm: InvoiceOrmEntity): Invoice {
    return new Invoice({
      id: orm.id,
      subscriptionId: orm.subscriptionId,
      userId: orm.userId,
      amount: Number(orm.amount),
      status: orm.status as unknown as InvoiceStatus,
      dueDate: orm.dueDate,
      paidAt: orm.paidAt ?? undefined,
      createdAt: orm.createdAt,
    });
  }

  static toPersistence(invoice: Invoice): Partial<InvoiceOrmEntity> {
    return {
      ...(invoice.id !== undefined && { id: invoice.id }),
      subscriptionId: invoice.subscriptionId,
      userId: invoice.userId,
      amount: invoice.amount,
      status: invoice.status as unknown as InvoiceStatusOrm,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt ?? null,
      createdAt: invoice.createdAt,
    };
  }
}

@Injectable()
export class InvoiceTypeOrmRepository implements IInvoiceRepository {
  constructor(
    @InjectRepository(InvoiceOrmEntity)
    private readonly repo: Repository<InvoiceOrmEntity>,
  ) {}

  async save(invoice: Invoice): Promise<Invoice> {
    const orm = this.repo.create(InvoiceMapper.toPersistence(invoice));
    const saved = await this.repo.save(orm);
    return InvoiceMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Invoice | null> {
    const orm = await this.repo.findOne({ where: { id } });
    return orm ? InvoiceMapper.toDomain(orm) : null;
  }

  async findByUserId(userId: number): Promise<Invoice[]> {
    const orms = await this.repo.find({ where: { userId } });
    return orms.map(InvoiceMapper.toDomain);
  }

  async findBySubscriptionId(subscriptionId: number): Promise<Invoice[]> {
    const orms = await this.repo.find({ where: { subscriptionId } });
    return orms.map(InvoiceMapper.toDomain);
  }

  async findPendingInvoices(): Promise<Invoice[]> {
    const orms = await this.repo.find({
      where: { status: InvoiceStatusOrm.PENDING },
    });
    return orms.map(InvoiceMapper.toDomain);
  }

  async update(invoice: Invoice): Promise<Invoice> {
    const orm = this.repo.create(InvoiceMapper.toPersistence(invoice));
    const saved = await this.repo.save(orm);
    return InvoiceMapper.toDomain(saved);
  }
}
