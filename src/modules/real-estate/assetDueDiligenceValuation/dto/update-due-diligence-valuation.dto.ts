import { PartialType } from '@nestjs/mapped-types';
import { CreateDueDiligenceValuationDto } from './create-due-diligence-valuation.dto';

export class UpdateDueDiligenceValuationDto extends PartialType(CreateDueDiligenceValuationDto) {}

