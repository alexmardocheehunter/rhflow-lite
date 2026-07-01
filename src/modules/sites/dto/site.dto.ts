import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateSiteDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @IsOptional()
  managerId?: number;

  @IsString()
  @IsOptional()
  qrCodeUrl?: string;
}

export class UpdateSiteDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @IsOptional()
  managerId?: number;

  @IsString()
  @IsOptional()
  qrCodeUrl?: string;
}
