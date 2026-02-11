import { PartialType } from '@nestjs/mapped-types';
import { CreateExitOpportunityDto } from './create-exit-opportunity.dto';

export class UpdateExitOpportunityDto extends PartialType(CreateExitOpportunityDto) {}

