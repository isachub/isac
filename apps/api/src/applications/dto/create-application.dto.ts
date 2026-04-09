import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';

enum TargetType {
  JOB = 'JOB',
  AUSBILDUNG = 'AUSBILDUNG',
  STUDIUM = 'STUDIUM',
}

export class CreateApplicationDto {
  @IsEnum(TargetType)
  targetType: TargetType;

  @IsString()
  @MinLength(2)
  titleOrRole: string;

  @IsString()
  @MinLength(2)
  companyOrInstitution: string;

  @IsString()
  @IsOptional()
  targetDescription?: string;
}
