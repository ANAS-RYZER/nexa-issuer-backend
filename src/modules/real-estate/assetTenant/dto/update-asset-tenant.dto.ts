import { PartialType } from '@nestjs/mapped-types';
import { CreateAssetTenantDto } from './create-asset-tenant.dto';

export class UpdateAssetTenantDto extends PartialType(CreateAssetTenantDto) {}

