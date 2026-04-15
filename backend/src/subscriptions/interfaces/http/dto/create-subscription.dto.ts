import { IsDateString, IsInt, IsPositive } from 'class-validator';

export class CreateSubscriptionDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsInt()
  @IsPositive()
  planId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
