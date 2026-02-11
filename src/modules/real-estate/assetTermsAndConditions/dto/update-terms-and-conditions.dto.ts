import { PartialType } from '@nestjs/mapped-types';
import { CreateTermsAndConditionsDto } from './create-terms-and-conditions.dto';

export class UpdateTermsAndConditionsDto extends PartialType(
  CreateTermsAndConditionsDto,
) {}

