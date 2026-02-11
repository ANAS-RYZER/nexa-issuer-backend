// Enum for Fee Types
export enum FeeType {
    REGISTRATION = "registration",
    LEGAL = "legal",
    PLATFORM = "platform",
    BROKERAGE = "brokerage",
    RESERVE = "reserve",
    INSURANCE = 'insurance'
  }
   
  // Interface for Asset Fee Config
  export interface IAssetFeeConfig {
    assetId: string; // MongoDB ObjectId as string
    type: FeeType;
    name: string;
    value: number;
    isPercentage: boolean;
    status: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  // Static Reserve Fee Config
  export const STATIC_RESERVE_FEE_CONFIG: Omit<IAssetFeeConfig, "assetId"> = {
    type: FeeType.RESERVE,
    name: "Reserve Fee",
    value: 1,
    isPercentage: true,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  export const STATIC_INSURANCE_FEE_CONFIG: Omit<IAssetFeeConfig, "assetId"> = {
    type: FeeType.INSURANCE,
    name: "Insurance On Title Deeds",
    value: 1,
    isPercentage: true,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };