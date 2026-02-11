import { IsMongoId } from 'class-validator';

export class AssetIdQueryDto {
  @IsMongoId({ message: 'Invalid asset ID format' })
  assetId: string;
}

export class AmenityIdParamDto {
  @IsMongoId({ message: 'Invalid amenity ID format' })
  amenityId: string;
}

