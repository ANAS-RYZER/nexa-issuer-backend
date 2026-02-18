import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class GenerateKycLinkDto {
  @IsString()
  @IsOptional()
  levelName?: string = 'id-and-liveness';

  @IsString()
  @IsOptional()
  externalActionId?: string;

  @IsNumber()
  @IsOptional()
  @Min(600)
  @Max(7200)
  ttlInSecs?: number = 1800;
}

