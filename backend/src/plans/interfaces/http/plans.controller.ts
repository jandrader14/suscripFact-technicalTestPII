import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../auth/interfaces/http/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/interfaces/http/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import {
  ICreatePlanUseCase,
  IDeletePlanUseCase,
  IGetAllPlansUseCase,
  IGetPlanByIdUseCase,
  IUpdatePlanUseCase,
} from '../../domain/ports/in/IPlanUseCase';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('plans')
export class PlansController {
  constructor(
    private readonly createPlanUseCase: ICreatePlanUseCase,
    private readonly getAllPlansUseCase: IGetAllPlansUseCase,
    private readonly getPlanByIdUseCase: IGetPlanByIdUseCase,
    private readonly updatePlanUseCase: IUpdatePlanUseCase,
    private readonly deletePlanUseCase: IDeletePlanUseCase,
  ) {}

  @Get()
  async findAll() {
    const plans = await this.getAllPlansUseCase.execute();
    return plans.map((plan) => plan.toPublic());
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const plan = await this.getPlanByIdUseCase.execute(id);
    return plan.toPublic();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() dto: CreatePlanDto) {
    const plan = await this.createPlanUseCase.execute(dto);
    return plan.toPublic();
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePlanDto,
  ) {
    const plan = await this.updatePlanUseCase.execute(id, dto);
    return plan.toPublic();
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.deletePlanUseCase.execute(id);
  }
}
