import { PartialType } from '@nestjs/mapped-types';
import { CreateDueDiligenceStructureDto } from './create-due-diligence-structure.dto';

export class UpdateDueDiligenceStructureDto extends PartialType(CreateDueDiligenceStructureDto) {}

