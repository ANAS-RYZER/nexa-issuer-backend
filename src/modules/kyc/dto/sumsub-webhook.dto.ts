import { IsString, IsOptional, IsObject, IsBoolean, IsEnum } from 'class-validator';

export class SumsubWebhookDto {
  @IsString()
  applicantId: string;

  @IsString()
  inspectionId: string;

  @IsString()
  externalUserId: string;

  @IsString()
  levelName: string;

  @IsString()
  type: string;

  @IsString()
  reviewStatus: string;

  @IsObject()
  @IsOptional()
  reviewResult?: {
    reviewAnswer?: string;
    reviewRejectType?: string;
    rejectLabels?: string[];
    moderationComment?: string;
    clientComment?: string;
  };

  @IsString()
  @IsOptional()
  correlationId?: string;

  @IsString()
  @IsOptional()
  applicantType?: string;

  @IsString()
  @IsOptional()
  reviewMode?: string;

  @IsBoolean()
  @IsOptional()
  sandboxMode?: boolean;

  @IsString()
  @IsOptional()
  clientId?: string;

  @IsString()
  createdAtMs: string;
}

