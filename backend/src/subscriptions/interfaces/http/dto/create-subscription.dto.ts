import { IsDateString, IsInt, IsPositive, Validate } from 'class-validator';
import {
  IsFutureDateValidator,
  IsEndDateAfterStartDateValidator,
} from '../validators/subscription-date.validators';

export class CreateSubscriptionDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsInt()
  @IsPositive()
  planId: number;

  @IsDateString()
  @Validate(IsFutureDateValidator)
  startDate: string;

  @IsDateString()
  @Validate(IsEndDateAfterStartDateValidator)
  endDate: string;
}
