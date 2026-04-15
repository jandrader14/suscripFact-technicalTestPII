import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PlansModule } from '../../../plans/interfaces/http/plans.module';
import { CheckSubscriptionStatusUseCase } from '../../application/use-cases/check-subscription-status.use-case';
import { CreateSubscriptionUseCase } from '../../application/use-cases/create-subscription.use-case';
import { GetUserSubscriptionsUseCase } from '../../application/use-cases/get-user-subscriptions.use-case';
import {
  ICheckSubscriptionStatusUseCase,
  ICreateSubscriptionUseCase,
  IGetUserSubscriptionsUseCase,
} from '../../domain/ports/in/ISubscriptionUseCase';
import { ISubscriptionRepository } from '../../domain/ports/out/ISubscriptionRepository';
import { SubscriptionOrmEntity } from '../../infrastructure/persistence/subscription.orm-entity';
import { SubscriptionTypeOrmRepository } from '../../infrastructure/persistence/subscription.typeorm.repository';
import { SubscriptionsController } from './subscriptions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriptionOrmEntity]),
    PlansModule,
  ],
  controllers: [SubscriptionsController],
  providers: [
    {
      provide: ISubscriptionRepository,
      useClass: SubscriptionTypeOrmRepository,
    },
    {
      provide: ICreateSubscriptionUseCase,
      useClass: CreateSubscriptionUseCase,
    },
    {
      provide: IGetUserSubscriptionsUseCase,
      useClass: GetUserSubscriptionsUseCase,
    },
    {
      provide: ICheckSubscriptionStatusUseCase,
      useClass: CheckSubscriptionStatusUseCase,
    },
  ],
  exports: [ISubscriptionRepository],
})
export class SubscriptionsModule {}
