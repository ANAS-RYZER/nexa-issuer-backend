export enum EAssetDocumentType {
    ASSET_PITCH_DECK = "asset-pitch-deck",
    ASSET_DOCUMENT = "asset-document",
    SPV_LEGAL_DOCUMENT = "spv-legal-document",
    VALUATION_REPORT = "valuation-report",
    MARKET_RESEARCH_REPORT = "market-research-report",
    OTHER = "other"
  }
  
  export enum EAssetDocumentFormat {
    PDF = "pdf",
    DOCX = "docx",
    DOC = "doc",
    XLSX = "xlsx",
    XLS = "xls",
    CSV = "csv",
    PPTX = "pptx",
    PPT = "ppt",
    JPG = "jpg",
    JPEG = "jpeg",
    PNG = "png"
  }
  
  interface documentUrl{
     name:string,
     url:string
  }
  
  export interface AssetDocument {
    adminId: string;
    assetId: string;
    name: string;
    type: EAssetDocumentType;
    format?: string;
    document:documentUrl;
    isProtected: boolean;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }