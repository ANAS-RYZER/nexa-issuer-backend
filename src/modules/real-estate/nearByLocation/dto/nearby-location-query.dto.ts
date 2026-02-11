import { IsMongoId, IsNotEmpty, IsString, IsNumberString } from 'class-validator';

export class AssetIdQueryDto {
  @IsMongoId()
  @IsNotEmpty()
  assetId: string;
}

export class LocationIdParamsDto {
  @IsMongoId()
  @IsNotEmpty()
  id: string;
}

export class GetPlacesQueryDto {
  @IsNumberString()
  @IsNotEmpty()
  lat: string;

  @IsNumberString()
  @IsNotEmpty()
  lng: string;

  @IsMongoId()
  @IsNotEmpty()
  assetId: string;
}

