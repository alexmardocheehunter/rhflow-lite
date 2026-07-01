import { IsString, IsOptional } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString()
  name: string;
}

export class UpdateLeaveTypeDto {
  @IsString()
  @IsOptional()
  name?: string;
}
