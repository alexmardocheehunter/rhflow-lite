import { IsString, IsOptional } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  name: string;
}

export class UpdatePositionDto {
  @IsString()
  @IsOptional()
  name?: string;
}
