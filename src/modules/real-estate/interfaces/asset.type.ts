// Enums for Asset properties
import { Schema } from "mongoose";
export enum AssetClass {
  COMMODITY = "commodity",
  HARDWARE = "hardware",
  EQUITY = "equity",
  DEBT = "debt",
  REAL_ESTATE = "real-estate",
  FUND = "fund",
  GOODS = "goods",
  IP_AND_LICENSES = "ip-and-licenses"
}

export enum InstrumentType {
  EQUITY = "equity",
  DIRECT_OWNERSHIP = "direct-ownership",
  DEBT = "debt",
  FUND = "fund"
}

export enum AssetCategory {
  COMMERCIAL = "commercial",
  HOLIDAY_HOMES = "holiday-homes",
  RESIDENTIAL = "residential",
  LAND_PARCEL = "land-parcel"
}

export enum AssetStage {
  UNDER_CONSTRUCTION = "under-construction",
  READY_TO_MOVE = "ready-to-move",
  COMPLETED = "completed",
  RENOVATED = "renovated",
  FULLY_RENTED = "fully-rented",
  FULLY_SOLD = "fully-sold",
  ON_HOLD = "on-hold",
  CANCELLED = "cancelled",
  ON_SALE = "on-sale",
  ON_LEASE = "on-lease",
}

export enum AssetStyle {
  TOWER = "tower",
  VILLA = "villa",
  BUILDING = "building",
  DEVELOPED_LAND = "developed-land",
  INDIVIDUAL_LAND = "individual-land"
}

export enum LockInPeriodType {
  MONTH = "months",
  YEAR = "year"
}

export enum Currency {
  INR = "INR",
  USD = "USD",
  GBP = "GBP",
  AED = "AED",
  QAR = "QAR",
  SGD= "SGD",
  EUR = "EUR",
  CAD = "CAD",
  CHF = "CHF",
  AUD = "AUD",
  NZD = "NZD",
  ZAR = "ZAR",
  MXN = "MXN",
  BRL = "BRL",
  CNY = "CNY",
  HKD = "HKD",
  JPY = "JPY",
  KRW = "KRW",
  SAR = "SAR",
  USDT= "USDT",
  USDC= "USDC",
}

// Interfaces for Asset Properties
export interface IInvestmentPerformance {
  targetCapitalAppreciation: number;
  numberOfYears: number;

  grossInvestmentMultiplier: number;
  netInvestmentMultiplier: number;
  estimatedSalePriceAsPerLockInPeriod: number;
  capitalGains: number;
  capitalGainsTax: number;
  estimatedReturnsAsPerLockInPeriod: number;
  interestRateonReserves : number; 
  netRentalYield: number;
  grossRentalYield: number;
  irr : number;
  moic : number;
  latestPropertyValue: number;
  latestPropertyValueDate: Date;
}

export interface IExpenses {
  monthlyExpenses: number;
  annualExpenses: number;
}

export interface IRentalInformation {
  rentPerSft: number;
  vacancyRate: number;
  grossMonthlyRent: number;
  netMonthlyRent: number;
  grossAnnualRent: number;
  netAnnualRent: number;
  expenses: IExpenses;
  netCashFlow: number;
}

export interface IEscrowInformation {
  country: string;
  state: string;
  escrowBank: string;
  escrowAgent: string;
}

export interface ILoanInformation {
  hasAssetPossesLoan: boolean;
  currentLoanAmount: number;
  totalNumberOfYears: number;
  totalLoanAmount: number;
  numberOfEMIsYetToPay: number;
  interestRate: number;
  pendingLoanAmount: number;
  bankName: string;
  brankBranch: string;
}

export interface ILegalAdivisory {
  name: string;
  document?: {
    name: string;
    url: string;
  };
}

export interface IAssetManagementCompany {
  name: string;
  document?: {
    name: string;
    url: string;
  };
}

export interface IBrokerage {
  name: string;
  document?: {
    name: string;
    url: string;
  };
}

export interface ITokenInformation {
  tokenSymbol: string;
  tokenSupply: number;
  minimumTokensToBuy: number;
  maximumTokensToBuy: number;
  availableTokensToBuy: number;
  tokenPrice: number; // totalPropertyValueAfterFees/tokenSupply
  blockchainProjectAddress?: string;
  blockchainEscrowAddress?: string;
  blockchainOrderManagerAddress?: string;
  blockchainDaoAddress?: string;
}

export interface IMedia {
  imageURL: string;
  videoURL: string;
  gallery: string[];
  pitchDeckURL: string;
}

export interface IHostedBy {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoURL: string;
  whatsappNumber: string;
  totalProjects: number;
  onGoingProjects: number;
  primeLocation: string;
  about: string;
  yearEstablished: number;
}

export enum EInvestorAcreditation {
  OPEN_TO_ALL = "open-to-all",
  ACCREDITED_ONLY = "accredited-only",
  INSTITUTIONAL_ONLY = "institutional-only",
  QUALIFIED = "qualified",
  CUSTOM_APPROVAL = "custom-approval"
}

export enum EKycOrAmlRequirements {
  REQUIRED_FOR_ALL = "required-for-all",
  ACCREDITED_ONLY = "accredited-only",
  ENHANCED = "enhanced",
  OPTIONAL = "optional",
  NONE = "none"
}

export interface IInvestorRequirementsAndTimeline {
  investorAcreditation: EInvestorAcreditation;
  kycOrAmlRequirements: EKycOrAmlRequirements;
  lockupPeriod: number;
  lockupPeriodType: LockInPeriodType;
  rentalYield: number;
  distributionStartDate: Date;
  distributionEndDate: Date;
}

export enum AssetStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  Draft = "draft",
  APPROVED="approved",
  REJECTED="rejected",
  PENDING="pending"
}

export interface IAsset {
  // adminId: Schema.Types.ObjectId; // Admin who created the asset
  companyId: Schema.Types.ObjectId;
  adminId: Schema.Types.ObjectId;
  class: AssetClass;
  category: AssetCategory;
  stage: string;
  style: AssetStyle;
  name: string;
  about: string;
  status: AssetStatus;
  bookmarks: number;
  country: string; //India
  state: string; //Karnataka
  city: string; //Bangalore
  landmark: string; // Whitefield in Bangalore (or) 100 feet road in Mumbai
  currency: string; //INR
  instrumentType: InstrumentType;
  metadata: {
    places: Record<string, string>;
  };
  assetAddress: string; // Onchain address of the asset when created

  latitude: number;
  longitude: number;

 
  
  totalNumberOfSfts: number;
  pricePerSft: number;
  basePropertyValue: number;
  totalPropertyValueAfterFees: number;
  investmentPerformance: IInvestmentPerformance;
  rentalInformation: IRentalInformation;
  escrowInformation: IEscrowInformation;
  legalAdivisory: ILegalAdivisory;
  assetManagementCompany: IAssetManagementCompany;
  brokerage: IBrokerage;
  loanInformation: ILoanInformation;

  //page-2
  tokenInformation: ITokenInformation;
  investorRequirementsAndTimeline: IInvestorRequirementsAndTimeline;
  //page-3
  media: IMedia;
  signatureDocuments: Schema.Types.ObjectId[]; // Array of document template IDs

  //page-4
  hostedBy: IHostedBy;
  createdAt?: Date;
  updatedAt?: Date;

  //
  totalFundsRaised: number;
} 