import { PartialType } from '@nestjs/mapped-types';
import { CreateRiskDisclosureDto } from './create-risk-disclosure.dto';

export class UpdateRiskDisclosureDto extends PartialType(CreateRiskDisclosureDto) {}

