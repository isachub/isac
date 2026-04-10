import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

enum TargetType {
  JOB = 'JOB',
  AUSBILDUNG = 'AUSBILDUNG',
  STUDIUM = 'STUDIUM',
}

export class UpsertProfileDto {
  @IsString() @IsOptional() fullName?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() street?: string;
  @IsString() @IsOptional() postalCode?: string;
  @IsString() @IsOptional() city?: string;
  @IsString() @IsOptional() country?: string;
  @IsDateString() @IsOptional() dateOfBirth?: string;
  @IsString() @IsOptional() nationality?: string;
  @IsString() @IsOptional() summary?: string;
  @IsString() @IsOptional() workExperience?: string;
  @IsString() @IsOptional() education?: string;
  @IsString() @IsOptional() skills?: string;
  @IsString() @IsOptional() languages?: string;
  @IsString() @IsOptional() certificates?: string;
  @IsEnum(TargetType) @IsOptional() targetType?: TargetType;
}
