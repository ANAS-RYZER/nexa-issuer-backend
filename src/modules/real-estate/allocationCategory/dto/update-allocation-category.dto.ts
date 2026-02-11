import { PartialType } from '@nestjs/mapped-types';
import { CreateAllocationCategoryDto } from './create-allocation-category.dto';

export class UpdateAllocationCategoryDto extends PartialType(
  CreateAllocationCategoryDto,
) {}

