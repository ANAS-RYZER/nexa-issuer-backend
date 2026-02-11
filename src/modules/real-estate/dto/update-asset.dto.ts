import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  MinLength,
  MaxLength,
  Matches,
  ValidateNested,
  IsArray,
  IsDate,
} from "class-validator";
import { Type } from "class-transformer";
import {
  AssetClass,
  AssetCategory,
  AssetStage,
  AssetStyle,
  Currency,
  InstrumentType,
  AssetStatus,
} from "../interfaces/asset.type";

// Nested DTOs for complex objects
export class InvestmentPerformanceDto {
  @IsOptional()
  @IsNumber()
  targetCapitalAppreciation?: number | null;

  @IsOptional()
  @IsNumber()
  numberOfYears?: number | null;

  @IsOptional()
  @IsNumber()
  grossTargetIRR?: number | null;

  @IsOptional()
  @IsNumber()
  netTargetIRR?: number | null;

  @IsOptional()
  @IsNumber()
  grossInvestmentMultiplier?: number | null;

  @IsOptional()
  @IsNumber()
  netInvestmentMultiplier?: number | null;

  @IsOptional()
  @IsNumber()
  estimatedSalePriceAsPerLockInPeriod?: number | null;

  @IsOptional()
  @IsNumber()
  capitalGains?: number | null;

  @IsOptional()
  @IsNumber()
  capitalGainsTax?: number | null;

  @IsOptional()
  @IsNumber()
  estimatedReturnsAsPerLockInPeriod?: number | null;

  @IsOptional()
  @IsNumber()
  interestRateonReserves?: number | null;

  @IsOptional()
  @IsNumber()
  netRentalYield?: number | null;

  @IsOptional()
  @IsNumber()
  grossRentalYield?: number | null;

  @IsOptional()
  @IsNumber()
  irr?: number | null;

  @IsOptional()
  @IsNumber()
  moic?: number | null;

  @IsOptional()
  @IsNumber()
  latestPropertyValue?: number | null;

  @IsOptional()
  @IsString()
  latestPropertyValueDate?: string | null;
}

export class DueDiligenceDto {
  @IsOptional()
  @IsArray()
  legal?: any[];

  @IsOptional()
  @IsArray()
  structure?: any[];

  @IsOptional()
  @IsArray()
  valuation?: any[];
}

export class RentalExpensesDto {
  @IsOptional()
  @IsNumber()
  monthlyExpenses?: number | null;

  @IsOptional()
  @IsNumber()
  annualExpenses?: number | null;
}

export class RentalInformationDto {
  @IsOptional()
  @IsNumber()
  rentPerSft?: number | null;

  @IsOptional()
  @IsNumber()
  vacancyRate?: number | null;

  @IsOptional()
  @IsNumber()
  grossMonthlyRent?: number | null;

  @IsOptional()
  @IsNumber()
  netMonthlyRent?: number | null;

  @IsOptional()
  @IsNumber()
  grossAnnualRent?: number | null;

  @IsOptional()
  @IsNumber()
  netAnnualRent?: number | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => RentalExpensesDto)
  expenses?: RentalExpensesDto;

  @IsOptional()
  @IsNumber()
  netCashFlow?: number | null;
}

export class EscrowInformationDto {
  @IsOptional()
  @IsString()
  country?: string | null;

  @IsOptional()
  @IsString()
  state?: string | null;

  @IsOptional()
  @IsString()
  escrowBank?: string | null;

  @IsOptional()
  @IsString()
  escrowAgent?: string | null;
}

export class DocumentDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsString()
  url?: string | null;
}

export class LegalAdvisoryDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentDto)
  document?: DocumentDto | null;
}

export class AssetManagementCompanyDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentDto)
  document?: DocumentDto | null;
}

export class BrokerageDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentDto)
  document?: DocumentDto | null;
}

export class LoanInformationDto {
  @IsOptional()
  @IsBoolean()
  hasAssetPossesLoan?: boolean | null;

  @IsOptional()
  @IsNumber()
  currentLoanAmount?: number | null;

  @IsOptional()
  @IsNumber()
  totalNumberOfYears?: number | null;

  @IsOptional()
  @IsNumber()
  totalLoanAmount?: number | null;

  @IsOptional()
  @IsNumber()
  numberOfEMIsYetToPay?: number | null;

  @IsOptional()
  @IsNumber()
  interestRate?: number | null;

  @IsOptional()
  @IsNumber()
  pendingLoanAmount?: number | null;

  @IsOptional()
  @IsString()
  bankName?: string | null;

  @IsOptional()
  @IsString()
  brankBranch?: string | null;
}

export class TokenInformationDto {
  @IsOptional()
  @IsString()
  tokenSymbol?: string | null;

  @IsOptional()
  @IsNumber()
  tokenSupply?: number | null;

  @IsOptional()
  @IsNumber()
  minimumTokensToBuy?: number | null;

  @IsOptional()
  @IsNumber()
  maximumTokensToBuy?: number | null;

  @IsOptional()
  @IsNumber()
  availableTokensToBuy?: number | null;

  @IsOptional()
  @IsNumber()
  tokenPrice?: number | null;

  @IsOptional()
  @IsString()
  blockchainProjectAddress?: string | null;

  @IsOptional()
  @IsString()
  blockchainEscrowAddress?: string | null;

  @IsOptional()
  @IsString()
  blockchainOrderManagerAddress?: string | null;

  @IsOptional()
  @IsString()
  blockchainDaoAddress?: string | null;
}

export class MediaDto {
  @IsOptional()
  @IsString()
  imageURL?: string | null;

  @IsOptional()
  @IsString()
  videoURL?: string | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gallery?: string[] | null;

  @IsOptional()
  @IsString()
  pitchDeckURL?: string | null;
}

export class HostedByDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsString()
  email?: string | null;

  @IsOptional()
  @IsString()
  website?: string | null;

  @IsOptional()
  @IsString()
  logoURL?: string | null;

  @IsOptional()
  @IsString()
  whatsappNumber?: string | null;

  @IsOptional()
  @IsNumber()
  totalProjects?: number | null;

  @IsOptional()
  @IsNumber()
  onGoingProjects?: number | null;

  @IsOptional()
  @IsString()
  primeLocation?: string | null;

  @IsOptional()
  @IsString()
  about?: string | null;

  @IsOptional()
  @IsNumber()
  yearEstablished?: number | null;
}

export class InvestorRequirementsAndTimelineDto {
  @IsOptional()
  @IsString()
  investorAcreditation?: string | null;

  @IsOptional()
  @IsString()
  kycOrAmlRequirements?: string | null;

  @IsOptional()
  @IsNumber()
  lockupPeriod?: number | null;

  @IsOptional()
  @IsString()
  lockupPeriodType?: string | null;

  @IsOptional()
  @IsNumber()
  rentalYield?: number | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  distributionStartDate?: string | null | Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  distributionEndDate?: string | null | Date;
}

export class UpdateAssetDto {
  @IsOptional()
  @Matches(/^[0-9a-fA-F]{24}$/)
  issuerId?: string;

  @IsOptional()
  @Matches(/^[0-9a-fA-F]{24}$/)
  spvId?: string;

  @IsOptional()
  @IsEnum(AssetClass)
  class?: AssetClass;

  @IsOptional()
  @IsEnum(AssetCategory)
  category?: AssetCategory;

  @IsOptional()
  @IsEnum(AssetStage)
  stage?: AssetStage;

  @IsOptional()
  @IsEnum(AssetStyle)
  style?: AssetStyle;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsEnum(InstrumentType)
  instrumentType?: InstrumentType;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  /* -------------------- TEXT FIELDS -------------------- */

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsString()
  assetAddress?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  /* -------------------- LOCATION -------------------- */

  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @IsOptional()
  @IsNumber()
  longitude?: number | null;

  /* -------------------- FLAGS -------------------- */

  @IsOptional()
  @IsBoolean()
  hasGlobalFeePercentagesSynced?: boolean;

  @IsOptional()
  @IsBoolean()
  hasGlobalFAQsSynced?: boolean;

  @IsOptional()
  @IsBoolean()
  hasGlobalRiskFactorsSynced?: boolean;

  @IsOptional()
  @IsBoolean()
  hasGlobalRiskDisclosuresSynced?: boolean;

  @IsOptional()
  @IsBoolean()
  hasGlobalAdditionalTaxesSynced?: boolean;

  @IsOptional()
  @IsBoolean()
  hasGlobalExitOpportunitiesSynced?: boolean;

  /* -------------------- NUMBERS -------------------- */

  @IsOptional()
  @IsNumber()
  totalNumberOfSfts?: number;

  @IsOptional()
  @IsNumber()
  pricePerSft?: number;

  @IsOptional()
  @IsNumber()
  basePropertyValue?: number;

  @IsOptional()
  @IsNumber()
  totalPropertyValueAfterFees?: number;

  @IsOptional()
  @IsNumber()
  totalFundsRaised?: number;

  /* -------------------- OBJECT BLOBS -------------------- */

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  faqs?: any;

  @IsOptional()
  tenants?: any;

  @IsOptional()
  amenities?: any;

  @IsOptional()
  expenses?: any;

  @IsOptional()
  features?: any;

  @IsOptional()
  documents?: any;

  @IsOptional()
  fees?: any;

  @IsOptional()
  riskFactors?: any;

  @IsOptional()
  riskDisclosures?: any;

  @IsOptional()
  termsAndConditions?: any;

  @IsOptional()
  exitOpportunities?: any;

  @IsOptional()
  additionalTaxes?: any;

  @IsOptional()
  nearByLocations?: any;

  /* -------------------- NESTED STRUCTURES -------------------- */

  @IsOptional()
  @ValidateNested()
  @Type(() => InvestmentPerformanceDto)
  investmentPerformance?: InvestmentPerformanceDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RentalInformationDto)
  rentalInformation?: RentalInformationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EscrowInformationDto)
  escrowInformation?: EscrowInformationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LegalAdvisoryDto)
  legalAdivisory?: LegalAdvisoryDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => AssetManagementCompanyDto)
  assetManagementCompany?: AssetManagementCompanyDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BrokerageDto)
  brokerage?: BrokerageDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LoanInformationDto)
  loanInformation?: LoanInformationDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => TokenInformationDto)
  tokenInformation?: TokenInformationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MediaDto)
  media?: MediaDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HostedByDto)
  hostedBy?: HostedByDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => InvestorRequirementsAndTimelineDto)
  investorRequirementsAndTimeline?: InvestorRequirementsAndTimelineDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DueDiligenceDto)
  dueDiligence?: DueDiligenceDto;

  @IsOptional()
  @IsArray()
  investors?: any[];

  @IsOptional()
  @IsNumber()
  completedOrdersCount?: number;

  @IsOptional()
  @IsArray()
  signatureDocuments?: any[];
}
