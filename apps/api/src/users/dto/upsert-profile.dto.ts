import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

enum TargetType {
  JOB = 'JOB',
  AUSBILDUNG = 'AUSBILDUNG',
  STUDIUM = 'STUDIUM',
}

export class UpsertProfileDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  nationality?: string;

  @IsEnum(TargetType)
  @IsOptional()
  targetType?: TargetType;
}
