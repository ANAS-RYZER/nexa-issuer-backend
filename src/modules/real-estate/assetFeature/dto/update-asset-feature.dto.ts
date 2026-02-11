import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetFeatureDto } from './create-asset-feature.dto';

export class UpdateAssetFeatureDto extends PartialType(CreateAssetFeatureDto) {}

