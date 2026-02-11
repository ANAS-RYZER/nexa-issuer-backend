import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument } from "mongoose";

export type SPVDocument = HydratedDocument<SPV>;

// Enums
export enum SPVType {
  LLC = "LLC",
  LP = "LP",
  TRUST = "Trust",
  CORPORATION = "Corporation",
  PRIVATE_LIMITED = "Private Limited",
  DAO_LLC = "DAO LLC",
  PARTNERSHIP = "Partnership",
  PUBLIC_ENTITY = "Public Entity",
}

export enum AccountType {
  SAVINGS = "Savings",
  CHECKING = "Checking",
  CURRENT = "Current",
  ESCROW = "Escrow",
}

export enum Role {
  DIRECTOR = "Director",
  ASSET_MANAGER = "Asset Manager",
  INVESTOR_MANAGER = "Investor Manager",
}

export enum Blockchain {
  ETHEREUM = "Ethereum",
  POLYGON = "Polygon",
  BINANCE_SMART_CHAIN = "Binance Smart Chain",
  XRPL = "XRPL",
}

export enum GovernanceModel {
  TOKEN_BASED = "Token-Weighted",
  EQUAL_WEIGHTED = "Equal-Voting",
  REPUTATION = "Reputation",
}
export enum DecisionType {
  ALL_DECISIONS = "all-decisions",
  MAJOR_DECISIONS = "major-decision-only",
}

export enum CompanyStatus {
  DRAFT = "Draft",
  PENDING = "Pending",
  APPROVAL = "Approval",
  REJECTED = "Rejected",
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  INR = "INR",
  AED = "AED",
}

// Subdocument Schemas
@Schema({ _id: false })
export class FileUpload {
  @Prop()
  name?: string;

  @Prop()
  url?: string;
}

const FileUploadSchema = SchemaFactory.createForClass(FileUpload);

// Board Member - Embedded in array
@Schema({ timestamps: true })
export class BoardMember {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, lowercase: true, trim: true })
  email: string;

  @Prop({ trim: true, match: /^\+[1-9]\d{0,3}$/ })
  countryCode?: string;

  @Prop({ required: true, trim: true })
  phoneNumber: string;

  @Prop({ required: true, trim: true })
  idNumber: string;

  @Prop({ type: FileUploadSchema })
  idProof?: FileUpload;

  @Prop({ required: true, enum: Object.values(Role) })
  role: Role;
}

const BoardMemberSchema = SchemaFactory.createForClass(BoardMember);

@Schema({ _id: false })
export class MemoAndTerms {
  @Prop()
  investmentMemorandum?: string;

  @Prop()
  termsAndConditions?: string;

  @Prop()
  riskFactor?: string;

  @Prop()
  investmentStrategy?: string;
}

const MemoAndTermsSchema = SchemaFactory.createForClass(MemoAndTerms);

@Schema({ _id: false })
export class EscrowBankDetails {
  @Prop()
  bankName?: string;

  @Prop({ enum: Object.values(AccountType) })
  accountType?: AccountType;

  @Prop()
  accountNumber?: string;

  @Prop()
  routingNumber?: string;

  @Prop()
  ifscCode?: string;

  @Prop({ type: FileUploadSchema })
  bankStatement?: FileUpload;
}

const EscrowBankDetailsSchema = SchemaFactory.createForClass(EscrowBankDetails);

@Schema({ _id: false })
export class LegalDocuments {
  @Prop({ type: FileUploadSchema })
  llcOperatingAgreement?: FileUpload;

  @Prop({ type: FileUploadSchema })
  articlesOfAssociation?: FileUpload;

  @Prop({ type: FileUploadSchema })
  memorandumOfAssociation?: FileUpload;

  @Prop({ type: FileUploadSchema })
  otherDocuments?: FileUpload;
}

const LegalDocumentsSchema = SchemaFactory.createForClass(LegalDocuments);

@Schema({ _id: false })
export class VotingPeriod {
  @Prop()
  days?: number;

  @Prop({ min: 0, max: 23 })
  hours?: number;
}

const VotingPeriodSchema = SchemaFactory.createForClass(VotingPeriod);

@Schema({ _id: false })
export class GovernanceRights {
  @Prop({ default: false })
  votingRights?: boolean;

  @Prop({ default: false })
  proposalCreation?: boolean;

  @Prop({ default: false })
  adminVotePower?: boolean;
}

const GovernanceRightsSchema = SchemaFactory.createForClass(GovernanceRights);

@Schema({ _id: false })
export class DAOConfiguration {
  @Prop()
  daoName?: string;

  @Prop()
  tokenSymbol?: string;

  @Prop({ enum: Object.values(Blockchain) })
  blockchain?: Blockchain;

  @Prop({ enum: Object.values(GovernanceModel) })
  governanceModel?: GovernanceModel;
  @Prop({ enum: Object.values(DecisionType) })
  decisionType?: DecisionType;

  @Prop({ min: 0, max: 100 })
  proposalThresholdPercent?: number;

  @Prop({ min: 0, max: 100 })
  quorumPercent?: number;

  @Prop({ type: VotingPeriodSchema })
  votingPeriod?: VotingPeriod;

  @Prop({ type: GovernanceRightsSchema })
  governanceRights?: GovernanceRights;

  @Prop({ default: false })
  issuerRepSignature?: boolean;
}

const DAOConfigurationSchema = SchemaFactory.createForClass(DAOConfiguration);

// Main SPV Schema
@Schema({
  collection: "spvs",
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      return ret;
    },
  },
})
export class SPV extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop()
  OnchainAddress?: string;

  @Prop({ required: true, enum: Object.values(SPVType) })
  type: SPVType;

  @Prop({ required: true, default: "USA" })
  jurisdiction: string;

  @Prop()
  blockchainCompanyId?: string;

  @Prop({ required: true })
  formationDate: Date;

  @Prop({ required: true, trim: true })
  businessPurpose: string;

  @Prop({ enum: Object.values(CompanyStatus), default: CompanyStatus.DRAFT })
  status: CompanyStatus;

  @Prop({
    enum: Object.values(Currency),
    default: Currency.USD,
    required: true,
  })
  currency: Currency;

  @Prop()
  logo?: string;

  @Prop({ type: MemoAndTermsSchema, default: {} })
  memoAndTerms?: MemoAndTerms;

  @Prop({ type: EscrowBankDetailsSchema, default: {} })
  escrowBankDetails?: EscrowBankDetails;

  @Prop({ type: LegalDocumentsSchema, default: {} })
  legalDocuments?: LegalDocuments;

  // Board Members as Array of Objects (Embedded)
  @Prop({ type: [BoardMemberSchema], default: [] })
  boardMembers: BoardMember[];

  @Prop({ type: DAOConfigurationSchema, default: {} })
  daoConfiguration?: DAOConfiguration;

  @Prop({ type: [String], default: [] })
  completedSteps: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const SPVSchema = SchemaFactory.createForClass(SPV);

// Indexes for performance optimization
SPVSchema.index({ userId: 1 }); // User's SPVs
SPVSchema.index({ name: 1 });
SPVSchema.index({ type: 1, status: 1 }); // Compound index for common queries
SPVSchema.index({ status: 1, createdAt: -1 }); // For filtering and sorting
SPVSchema.index({ userId: 1, status: 1 }); // User's SPVs by status
SPVSchema.index({ OnchainAddress: 1 }, { sparse: true }); // Sparse index for optional field
SPVSchema.index({ blockchainCompanyId: 1 }, { sparse: true });
SPVSchema.index({ jurisdiction: 1 });
SPVSchema.index({ "boardMembers.email": 1 }); // For board member queries
