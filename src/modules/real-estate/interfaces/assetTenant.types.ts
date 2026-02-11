export enum TenantStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    PENDING = "pending"
  }
  
  export enum TenantType {
    CORPORATE = "corporate",
    INDIVIDUAL = "individual",
    GOVERNMENT = "government",
    EDUCATIONAL = "educational",
    RETAIL = "retail",
    OTHER = "other"
  }
  
  export interface IIdProof {
    name: string;
    url: string;
  }
  
  export interface IAssetTenant {
    assetId: string;
    name: string;
    rentPerSft: number;
    sftsAllocated: number;
    annualRentEscalation: number;
    startDate: Date;
    endDate: Date;
    status: TenantStatus;
    type: TenantType;
    lockInPeriod: number;
    leasePeriod: number;
    securityDeposit: number;
    interestOnSecurityDeposit: number;
    agreement: IIdProof;
    logo: string;
    createdAt?: Date;
    updatedAt?: Date;
  } 