import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CreatePlanUseCase } from '../../application/use-cases/create-plan.use-case';
import { DeletePlanUseCase } from '../../application/use-cases/delete-plan.use-case';
import { GetAllPlansUseCase } from '../../application/use-cases/get-all-plans.use-case';
import { GetPlanByIdUseCase } from '../../application/use-cases/get-plan-by-id.use-case';
import { UpdatePlanUseCase } from '../../application/use-cases/update-plan.use-case';
import {
  ICreatePlanUseCase,
  IDeletePlanUseCase,
  IGetAllPlansUseCase,
  IGetPlanByIdUseCase,
  IUpdatePlanUseCase,
} from '../../domain/ports/in/IPlanUseCase';
import { IPlanRepository } from '../../domain/ports/out/IPlanRepository';
import { PlanOrmEntity } from '../../infrastructure/persistence/plan.orm-entity';
import { PlanTypeOrmRepository } from '../../infrastructure/persistence/plan.typeorm.repository';
import { PlansController } from './plans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PlanOrmEntity])],
  controllers: [PlansController],
  providers: [
    {
      provide: IPlanRepository,
      useClass: PlanTypeOrmRepository,
    },
    {
      provide: ICreatePlanUseCase,
      useClass: CreatePlanUseCase,
    },
    {
      provide: IGetAllPlansUseCase,
      useClass: GetAllPlansUseCase,
    },
    {
      provide: IGetPlanByIdUseCase,
      useClass: GetPlanByIdUseCase,
    },
    {
      provide: IUpdatePlanUseCase,
      useClass: UpdatePlanUseCase,
    },
    {
      provide: IDeletePlanUseCase,
      useClass: DeletePlanUseCase,
    },
  ],
  exports: [IPlanRepository],
})
export class PlansModule {}
