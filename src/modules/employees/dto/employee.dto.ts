import { IsString, IsOptional, IsEmail, IsDateString, IsInt } from 'class-validator';

export class CreateEmployeeDto {
  @IsInt()
  siteId: number;

  @IsInt()
  @IsOptional()
  positionId?: number;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;
}

export class UpdateEmployeeDto {
  @IsInt()
  @IsOptional()
  siteId?: number;

  @IsInt()
  @IsOptional()
  positionId?: number;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;
}
