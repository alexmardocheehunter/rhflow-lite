import { IsString, IsOptional, IsInt, IsDateString, IsEnum } from 'class-validator';
import { LeaveRequestStatus } from '@prisma/client';

export class CreateLeaveRequestDto {
  @IsInt()
  leaveTypeId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class ValidateLeaveRequestDto {
  @IsEnum(LeaveRequestStatus)
  status: LeaveRequestStatus;
}
