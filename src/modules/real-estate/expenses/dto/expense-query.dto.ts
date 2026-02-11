import { IsString, IsMongoId } from 'class-validator';

export class AssetIdQueryDto {
  @IsMongoId({ message: 'Invalid asset ID format' })
  assetId: string;
}

export class ExpenseIdParamDto {
  @IsMongoId({ message: 'Invalid expense ID format' })
  expenseId: string;
}

export class AssetIdParamDto {
  @IsMongoId({ message: 'Invalid asset ID format' })
  assetId: string;
}

