// Interface for Asset Due Diligence Structure
export interface IAssetDueDiligenceStructure {
    adminId: string;
    assetId: string; // This will be ObjectId from MongoDB
    name: string;
    logoUrl: string;
    location: string;
    link: string;
    createdAt?: Date;
    updatedAt?: Date;
  } 