import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../auth/interfaces/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/interfaces/http/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtUser } from '../../../common/types/jwt-user.type';
import {
  IGenerateInvoiceUseCase,
  IGetUserInvoicesUseCase,
  IPayInvoiceUseCase,
  IUpdateOverdueInvoicesUseCase,
} from '../../domain/ports/in/IBillingUseCase';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';

@Controller('billing/invoices')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    private readonly generateInvoiceUseCase: IGenerateInvoiceUseCase,
    private readonly payInvoiceUseCase: IPayInvoiceUseCase,
    private readonly getUserInvoicesUseCase: IGetUserInvoicesUseCase,
    private readonly updateOverdueInvoicesUseCase: IUpdateOverdueInvoicesUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async generate(@Body() dto: GenerateInvoiceDto) {
    return this.generateInvoiceUseCase.execute({
      subscriptionId: dto.subscriptionId,
      userId: dto.userId,
      planType: dto.planType,
      planPrice: dto.planPrice,
      maxUsers: dto.maxUsers,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      dueDate: new Date(dto.dueDate),
    });
  }

  @Post(':id/pay')
  @HttpCode(HttpStatus.OK)
  async pay(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: JwtUser,
  ) {
    const invoice = await this.getUserInvoicesUseCase.execute(currentUser.userId);
    const owns = invoice.some((inv) => inv.id === id);
    if (currentUser.role !== 'ADMIN' && !owns) {
      throw new ForbiddenException('No tienes permiso para pagar esta factura.');
    }
    return this.payInvoiceUseCase.execute(id);
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() currentUser: JwtUser,
  ) {
    this.assertAccessAllowed(userId, currentUser);
    return this.getUserInvoicesUseCase.execute(userId);
  }

  @Patch('overdue')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateOverdue(): Promise<void> {
    await this.updateOverdueInvoicesUseCase.execute();
  }

  private assertAccessAllowed(userId: number, currentUser: JwtUser): void {
    if (currentUser.role !== 'ADMIN' && currentUser.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para acceder a este recurso.');
    }
  }
}
