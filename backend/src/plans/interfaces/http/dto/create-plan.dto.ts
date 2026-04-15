import { IsEnum, IsNumber, IsPositive, IsString, MinLength } from 'class-validator';

import { PlanType } from '../../../domain/entities/Plan';

export class CreatePlanDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEnum(PlanType)
  type: PlanType;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsString()
  @MinLength(10)
  description: string;

  @IsNumber()
  @IsPositive()
  maxUsers: number;
}
