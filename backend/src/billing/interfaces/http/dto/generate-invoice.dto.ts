import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class GenerateInvoiceDto {
  @IsInt()
  @IsPositive()
  subscriptionId: number;

  @IsInt()
  @IsPositive()
  userId: number;

  @IsString()
  planType: string;

  @IsNumber()
  @IsPositive()
  planPrice: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  maxUsers?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsDateString()
  dueDate: string;
}
