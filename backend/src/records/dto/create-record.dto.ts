import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateRecordDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  irNo: string;

  @IsOptional()
  @IsString()
  rank?: string;

  @IsNotEmpty()
  @IsString()
  leaveType: string;

  @IsOptional()
  @IsIn(['Paid', 'Unpaid'])
  paidStatus?: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsDateString()
  resumptionDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
