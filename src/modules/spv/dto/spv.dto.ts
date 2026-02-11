import {
  IsString,
  IsEnum,
  IsOptional,
  IsDate,
  IsArray,
  IsBoolean,
  IsNumber,
  ValidateNested,
  IsNotEmpty,
  Min,
  Max,
} from "class-validator";
import { Type } from "class-transformer";
import {
  SPVType,
  AccountType,
  Role,
  Blockchain,
  GovernanceModel,
  CompanyStatus,
  Currency,
  DecisionType,
} from "../schemas/spv.schema";

export class FileUploadDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  url?: string;
}

export class BoardMemberDto {
  @IsNotEmpty({ message: "Full name is required" })
  @IsString()
  fullName: string;

  @IsNotEmpty({ message: "Email is required" })
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsNotEmpty({ message: "Phone number is required" })
  @IsString()
  phoneNumber: string;

  @IsNotEmpty({ message: "ID number is required" })
  @IsString()
  idNumber: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FileUploadDto)
  idProof?: FileUploadDto;

  @IsNotEmpty({ message: "Role is required" })
  @IsEnum(Role, {
    message:
      "Invalid role. Must be DIRECTOR, ASSET_MANAGER, or INVESTOR_MANAGER",
  })
  role: Role;
}

/** DTO for partial update of a board member (embedded in SPV) */
export class UpdateBoardMemberDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  idNumber?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FileUploadDto)
  idProof?: FileUploadDto;

  @IsOptional()
  @IsEnum(Role, {
    message:
      "Invalid role. Must be Director, Asset Manager, or Investor Manager",
  })
  role?: Role;
}

export class MemoAndTermsDto {
  @IsOptional()
  @IsString()
  investmentMemorandum?: string;

  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @IsOptional()
  @IsString()
  riskFactor?: string;

  @IsOptional()
  @IsString()
  investmentStrategy?: string;
}

export class EscrowBankDetailsDto {
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  routingNumber?: string;

  @IsOptional()
  @IsString()
  ifscCode?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => FileUploadDto)
  bankStatement?: FileUploadDto;
}

export class LegalDocumentsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => FileUploadDto)
  llcOperatingAgreement?: FileUploadDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FileUploadDto)
  articlesOfAssociation?: FileUploadDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FileUploadDto)
  memorandumOfAssociation?: FileUploadDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => FileUploadDto)
  otherDocuments?: FileUploadDto;
}

export class VotingPeriodDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  days?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(23)
  hours?: number;
}

export class GovernanceRightsDto {
  @IsOptional()
  @IsBoolean()
  votingRights?: boolean;

  @IsOptional()
  @IsBoolean()
  proposalCreation?: boolean;

  @IsOptional()
  @IsBoolean()
  adminVotePower?: boolean;
}

export class DAOConfigurationDto {
  @IsOptional()
  @IsString()
  daoName?: string;

  @IsOptional()
  @IsString()
  tokenSymbol?: string;

  @IsOptional()
  @IsEnum(Blockchain)
  blockchain?: Blockchain;

  @IsOptional()
  @IsEnum(GovernanceModel)
  governanceModel?: GovernanceModel;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  proposalThresholdPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  quorumPercent?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => VotingPeriodDto)
  votingPeriod?: VotingPeriodDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => GovernanceRightsDto)
  governanceRights?: GovernanceRightsDto;

  @IsOptional()
  @IsBoolean()
  issuerRepSignature?: boolean;

  @IsOptional()
  @IsEnum(DecisionType)
  decisionType?: DecisionType;
}

export class CreateSPVDto {
  // Note: userId will be injected from authenticated user, not from request body

  @IsNotEmpty({ message: "SPV name is required" })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  OnchainAddress?: string;

  @IsNotEmpty({ message: "SPV type is required" })
  @IsEnum(SPVType, {
    message: "Invalid SPV type. Must be LLC, LP, TRUST, or CORPORATION",
  })
  type: SPVType;

  @IsOptional()
  @IsString()
  jurisdiction?: string;

  @IsOptional()
  @IsString()
  blockchainCompanyId?: string;

  @IsNotEmpty({ message: "Formation date is required" })
  @Type(() => Date)
  @IsDate({ message: "Invalid formation date" })
  formationDate: Date;

  @IsNotEmpty({ message: "Business purpose is required" })
  @IsString()
  businessPurpose: string;

  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MemoAndTermsDto)
  memoAndTerms?: MemoAndTermsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EscrowBankDetailsDto)
  escrowBankDetails?: EscrowBankDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LegalDocumentsDto)
  legalDocuments?: LegalDocumentsDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BoardMemberDto)
  boardMembers?: BoardMemberDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DAOConfigurationDto)
  daoConfiguration?: DAOConfigurationDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completedSteps?: string[];
}

export class UpdateSPVDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  OnchainAddress?: string;

  @IsOptional()
  @IsEnum(SPVType)
  type?: SPVType;

  @IsOptional()
  @IsString()
  jurisdiction?: string;

  @IsOptional()
  @IsString()
  blockchainCompanyId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  formationDate?: Date;

  @IsOptional()
  @IsString()
  businessPurpose?: string;

  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MemoAndTermsDto)
  memoAndTerms?: MemoAndTermsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => EscrowBankDetailsDto)
  escrowBankDetails?: EscrowBankDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LegalDocumentsDto)
  legalDocuments?: LegalDocumentsDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BoardMemberDto)
  boardMembers?: BoardMemberDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DAOConfigurationDto)
  daoConfiguration?: DAOConfigurationDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  completedSteps?: string[];
}
