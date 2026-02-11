import { PartialType } from '@nestjs/mapped-types';
import { CreateDueDiligenceLegalDto } from './create-due-diligence-legal.dto';

export class UpdateDueDiligenceLegalDto extends PartialType(CreateDueDiligenceLegalDto) {}

