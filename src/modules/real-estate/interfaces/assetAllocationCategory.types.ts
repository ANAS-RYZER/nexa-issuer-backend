import { Types } from 'mongoose';

export enum VestingType {
    NO_VESTING = "no-vesting",
    LINEAR_VESTING = "linear-vesting",
    CLIFF_VESTING = "cliff-vesting"
}
export interface IAllocationCategory {
    adminId: Types.ObjectId;
    assetId: Types.ObjectId;
    category: string;
    percentage: number;
    tokens: number;
    vestingType: VestingType;
    vestingStartDate?: Date;
    vestingEndDate?: Date;
    cliffPeriod?: number;
    description?: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IAllocationCategoryResponse extends Omit<IAllocationCategory, 'assetId'> {
    id: string;
    assetId: string;
} 