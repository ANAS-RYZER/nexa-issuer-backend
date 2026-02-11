import { PartialType } from '@nestjs/mapped-types';
import { CreateAdditionalTaxDto } from './create-additional-tax.dto';

export class UpdateAdditionalTaxDto extends PartialType(
  CreateAdditionalTaxDto
) {}

