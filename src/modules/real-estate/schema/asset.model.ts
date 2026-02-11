import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, HydratedDocument, Schema as MongooseSchema } from "mongoose";
import {
  AssetClass,
  AssetCategory,
  AssetStyle,
  LockInPeriodType,
  AssetStage,
  InstrumentType,
  Currency,
  AssetStatus,
  EInvestorAcreditation,
  EKycOrAmlRequirements,
} from "../interfaces/asset.type";

export type AssetDocument = HydratedDocument<Asset>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret: Record<string, unknown>) => {
      delete ret.__v;
      return ret;
    },
  },
})
export class Asset extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "IssuerUser",
    default: null,
  })
  issuerId?: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: "SPV",
    required: true,
  })
  spvId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(AssetClass),
  })
  class?: AssetClass;

  @Prop({
    type: String,
    enum: Object.values(AssetCategory),
  })
  category?: AssetCategory;

  @Prop({
    type: String,
    enum: Object.values(AssetStage),
  })
  stage?: AssetStage;

  @Prop({
    type: String,
    enum: Object.values(AssetStyle),
  })
  style?: AssetStyle;

  @Prop({
    type: String,
    enum: Object.values(Currency),
    required: true,
  })
  currency: Currency;

  @Prop({
    type: String,
    enum: Object.values(InstrumentType),
    required: true,
  })
  instrumentType: InstrumentType;

  @Prop({
    type: Object,
    default: {},
  })
  metadata?: Record<string, any>;

  @Prop({
    type: String,
    trim: true,
    default: null,
  })
  assetAddress?: string;

  @Prop({
    type: String,
    enum: Object.values(AssetStatus),
    default: AssetStatus.Draft,
  })
  status: AssetStatus;

  @Prop({
    type: Number,
    default: 0,
  })
  bookmarks: number;

  @Prop({
    type: String,
    trim: true,
  })
  name?: string;

  @Prop({
    type: String,
    trim: true,
  })
  about?: string;

  @Prop({
    type: String,
    trim: true,
  })
  country?: string;

  @Prop({
    type: String,
    trim: true,
  })
  state?: string;

  @Prop({
    type: String,
    trim: true,
  })
  city?: string;

  @Prop({
    type: String,
    trim: true,
  })
  landmark?: string;

  @Prop({
    type: Number,
    default: null,
  })
  latitude?: number;

  @Prop({
    type: Number,
    default: null,
  })
  longitude?: number;

  @Prop({
    type: Boolean,
    default: false,
  })
  hasGlobalFeePercentagesSynced: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  hasGlobalFAQsSynced: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  hasGlobalRiskFactorsSynced: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  hasGlobalRiskDisclosuresSynced: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  hasGlobalAdditionalTaxesSynced: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  hasGlobalExitOpportunitiesSynced: boolean;

  @Prop({
    type: Number,
    default: 0,
  })
  totalNumberOfSfts: number;

  @Prop({
    type: Number,
    default: 0,
  })
  pricePerSft: number;

  @Prop({
    type: Number,
    default: 0,
  })
  basePropertyValue: number;

  @Prop({
    type: Number,
    default: 0,
  })
  totalPropertyValueAfterFees: number;

  @Prop({
    type: {
      targetCapitalAppreciation: { type: Number, default: 0 },
      numberOfYears: { type: Number, default: 0 },

      netInvestmentMultiplier: { type: Number, default: 0 },
      estimatedSalePriceAsPerLockInPeriod: { type: Number, default: 0 },
      capitalGains: { type: Number, default: 0 },
      capitalGainsTax: { type: Number, default: 0 },
      estimatedReturnsAsPerLockInPeriod: { type: Number, default: 0 },
      interestRateonReserves: { type: Number, default: 0 },
      netRentalYield: { type: Number, default: 0 },
      grossRentalYield: { type: Number, default: 0 },
      irr: { type: Number, default: 0 },
      moic: { type: Number, default: 0 },
      latestPropertyValue: { type: Number, default: 0 },
      latestPropertyValueDate: { type: Date, default: null },
    },
    default: {},
  })
  investmentPerformance?: {
    targetCapitalAppreciation: number;
    numberOfYears: number;
    // signatureDocuments: MongooseSchema.Types.ObjectId[];
    netInvestmentMultiplier: number;
    estimatedSalePriceAsPerLockInPeriod: number;
    capitalGains: number;
    capitalGainsTax: number;
    estimatedReturnsAsPerLockInPeriod: number;
    interestRateonReserves: number;
    netRentalYield: number;
    grossRentalYield: number;
    irr: number;
    moic: number;
    latestPropertyValue: number;
    latestPropertyValueDate: Date | null;
  };

  @Prop({
    type: {
      investorAcreditation: {
        type: String,
        enum: Object.values(EInvestorAcreditation),
        default: EInvestorAcreditation.OPEN_TO_ALL,
      },
      kycOrAmlRequirements: {
        type: String,
        enum: Object.values(EKycOrAmlRequirements),
        default: EKycOrAmlRequirements.REQUIRED_FOR_ALL,
      },
      lockupPeriod: { type: Number, default: 0 },
      lockupPeriodType: {
        type: String,
        enum: Object.values(LockInPeriodType),
        default: LockInPeriodType.MONTH,
      },
      rentalYield: { type: Number, default: 0 },
      distributionStartDate: { type: Date, default: null },
      distributionEndDate: { type: Date, default: null },
    },
    default: {},
  })
  investorRequirementsAndTimeline?: {
    investorAcreditation: EInvestorAcreditation;
    kycOrAmlRequirements: EKycOrAmlRequirements;
    lockupPeriod: number;
    lockupPeriodType: LockInPeriodType;
    rentalYield: number;
    distributionStartDate: Date | null;
    distributionEndDate: Date | null;
  };

  @Prop({
    type: {
      rentPerSft: { type: Number, default: 0 },
      vacancyRate: { type: Number, default: 0 },
      grossMonthlyRent: { type: Number, default: 0 },
      netMonthlyRent: { type: Number, default: 0 },
      grossAnnualRent: { type: Number, default: 0 },
      netAnnualRent: { type: Number, default: 0 },
      expenses: {
        monthlyExpenses: { type: Number, default: 0 },
        annualExpenses: { type: Number, default: 0 },
      },
      netCashFlow: { type: Number, default: 0 },
    },
    default: {},
  })
  rentalInformation?: {
    rentPerSft: number;
    vacancyRate: number;
    grossMonthlyRent: number;
    netMonthlyRent: number;
    grossAnnualRent: number;
    netAnnualRent: number;
    expenses: {
      monthlyExpenses: number;
      annualExpenses: number;
    };
    netCashFlow: number;
  };

  @Prop({
    type: {
      country: { type: String, trim: true, default: "" },
      state: { type: String, trim: true, default: "" },
      escrowBank: { type: String, trim: true, default: "" },
      escrowAgent: { type: String, trim: true, default: "" },
    },
    default: {},
  })
  escrowInformation?: {
    country: string;
    state: string;
    escrowBank: string;
    escrowAgent: string;
  };

  @Prop({
    type: {
      name: { type: String, trim: true, default: "" },
      document: {
        type: {
          name: { type: String, trim: true },
          url: { type: String, trim: true },
        },
        default: null,
      },
    },
    default: {},
  })
  legalAdivisory?: {
    name: string;
    document?: {
      name: string;
      url: string;
    } | null;
  };

  @Prop({
    type: {
      name: { type: String, trim: true, default: "" },
      document: {
        type: {
          name: { type: String, trim: true },
          url: { type: String, trim: true },
        },
        default: null,
      },
    },
    default: {},
  })
  assetManagementCompany?: {
    name: string;
    document?: {
      name: string;
      url: string;
    } | null;
  };

  @Prop({
    type: {
      name: { type: String, trim: true, default: "" },
      document: {
        type: {
          name: { type: String, trim: true },
          url: { type: String, trim: true },
        },
        default: null,
      },
    },
    default: {},
  })
  brokerage?: {
    name: string;
    document?: {
      name: string;
      url: string;
    } | null;
  };

  @Prop({
    type: {
      hasAssetPossesLoan: { type: Boolean, default: false },
      currentLoanAmount: { type: Number, default: 0 },
      totalNumberOfYears: { type: Number, default: 0 },
      totalLoanAmount: { type: Number, default: 0 },
      numberOfEMIsYetToPay: { type: Number, default: 0 },
      interestRate: { type: Number, default: 0 },
      pendingLoanAmount: { type: Number, default: 0 },
      bankName: { type: String, trim: true, default: "" },
      brankBranch: { type: String, trim: true, default: "" },
    },
    default: {},
  })
  loanInformation?: {
    hasAssetPossesLoan: boolean;
    currentLoanAmount: number;
    totalNumberOfYears: number;
    totalLoanAmount: number;
    numberOfEMIsYetToPay: number;
    interestRate: number;
    pendingLoanAmount: number;
    bankName: string;
    brankBranch: string;
  };

  @Prop({
    type: {
      tokenSymbol: { type: String, trim: true, default: null },
      tokenSupply: { type: Number, default: 0 },
      minimumTokensToBuy: { type: Number, default: 0 },
      maximumTokensToBuy: { type: Number, default: 0 },
      availableTokensToBuy: { type: Number, default: 0 },
      tokenPrice: { type: Number, default: 0 },
      blockchainProjectAddress: { type: String, default: null },
      blockchainEscrowAddress: { type: String, default: null },
      blockchainOrderManagerAddress: { type: String, default: null },
      blockchainDaoAddress: { type: String, default: null },
    },
    default: {},
  })
  tokenInformation?: {
    tokenSymbol: string | null;
    tokenSupply: number;
    minimumTokensToBuy: number;
    maximumTokensToBuy: number;
    availableTokensToBuy: number;
    tokenPrice: number;
    blockchainProjectAddress: string | null;
    blockchainEscrowAddress: string | null;
    blockchainOrderManagerAddress: string | null;
    blockchainDaoAddress: string | null;
  };

  @Prop({
    type: {
      imageURL: { type: String, trim: true, default: "" },
      videoURL: { type: String, trim: true, default: "" },
      gallery: {
        type: [{ type: String, trim: true }],
        default: [],
      },
      pitchDeckURL: { type: String, trim: true, default: "" },
    },
    default: {},
  })
  media?: {
    imageURL: string;
    videoURL: string;
    gallery: string[];
    pitchDeckURL: string;
  };

  @Prop({
    type: {
      name: { type: String, trim: true, default: "" },
      isVerified: { type: Boolean, default: false },
      address: { type: String, trim: true, default: "" },
      phone: { type: String, trim: true, default: "" },
      email: { type: String, trim: true, default: "" },
      website: { type: String, trim: true, default: "" },
      logoURL: { type: String, trim: true, default: "" },
      whatsappNumber: { type: String, trim: true, default: "" },
      totalProjects: { type: Number, default: 0 },
      onGoingProjects: { type: Number, default: 0 },
      primeLocation: { type: String, trim: true, default: "" },
      about: { type: String, trim: true, default: "" },
      yearEstablished: { type: Number, default: null },
    },
    default: {},
  })
  hostedBy?: {
    name: string;
    isVerified: boolean;
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
    yearEstablished: number | null;
  };

  @Prop({
    type: Number,
    default: 0,
  })
  totalFundsRaised: number;

  @Prop({
    signatureDocuments: [
      {
        type: MongooseSchema.Types.ObjectId,
        ref: "documenttemplates",
      },
    ],
  })
  signatureDocuments: MongooseSchema.Types.ObjectId[];

  // Timestamps (auto-generated by Mongoose)
  createdAt?: Date;
  updatedAt?: Date;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);

// Middleware to automatically set currency from company before validation
AssetSchema.pre("validate", async function (next) {
  // Only set currency if not provided and companyId exists
  if (!this.currency && this.spvId) {
    try {
      const SPVModel = this.model("spvs");
      const spv = await SPVModel.findById(this.spvId).select("currency");

      if (spv && (spv as any).currency) {
        this.currency = (spv as any).currency;
        console.log(
          `Auto-set asset currency to ${this.currency} from SPV ${this.spvId}`,
        );
      } else {
        return next(new Error("SPV not found or SPV has no currency set"));
      }
    } catch (error) {
      console.error("Error fetching SPV currency for asset:", error);
      return next(error as Error);
    }
  }
  next();
});
