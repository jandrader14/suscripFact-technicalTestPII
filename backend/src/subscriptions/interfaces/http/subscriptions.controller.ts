import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../auth/interfaces/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/interfaces/http/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { JwtUser } from '../../../common/types/jwt-user.type';
import {
  ICheckSubscriptionStatusUseCase,
  ICreateSubscriptionUseCase,
  IGetUserSubscriptionsUseCase,
} from '../../domain/ports/in/ISubscriptionUseCase';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(
    private readonly createSubscriptionUseCase: ICreateSubscriptionUseCase,
    private readonly getUserSubscriptionsUseCase: IGetUserSubscriptionsUseCase,
    private readonly checkSubscriptionStatusUseCase: ICheckSubscriptionStatusUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async create(@Body() dto: CreateSubscriptionDto) {
    return this.createSubscriptionUseCase.execute({
      userId: dto.userId,
      planId: dto.planId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() currentUser: JwtUser,
  ) {
    this.assertAccessAllowed(userId, currentUser);
    return this.getUserSubscriptionsUseCase.execute(userId);
  }

  @Get('status/:userId')
  async checkStatus(
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() currentUser: JwtUser,
  ) {
    this.assertAccessAllowed(userId, currentUser);
    return this.checkSubscriptionStatusUseCase.execute(userId);
  }

  private assertAccessAllowed(userId: number, currentUser: JwtUser): void {
    if (currentUser.role !== 'ADMIN' && currentUser.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para acceder a este recurso.');
    }
  }
}
