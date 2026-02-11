export interface AdminAssetListingItem {
  _id: string;
  name: string;
  landmark?: string;
  city: string;
  state: string;
  country: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  totalTokens?: number;
  availableTokensToBuy?: number;
  blockchainProjectAddress?: string;
  percentageOfTokensSold: number;
  companyName?: string;
  completedSteps: string[];
  completedStepsCount: number;
  totalSteps: number;
  // Order-related fields (to be implemented when Order model is available)
  orderCount?: number;
  uniqueInvestorCount?: number;
}

export interface AdminAssetListingResponse {
  assets: AdminAssetListingItem[];
  totalCount: number;
  currentPage: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

