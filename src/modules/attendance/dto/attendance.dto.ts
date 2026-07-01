import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { AttendanceType } from '@prisma/client';

export class CreateAttendanceDto {
  @IsNumber()
  siteId: number;

  @IsEnum(AttendanceType)
  type: AttendanceType;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;
}
