import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetExpenseDto } from './create-expense.dto';

export class UpdateAssetExpenseDto extends PartialType(CreateAssetExpenseDto) {}

