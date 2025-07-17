export interface Asset {
  symbol: string;
  name: string;
  price: number;
  lastPrice?: number; // Previous price before last update
  targetAllocation: number;
  currentValue: number;
  exchange?: string; // Optional for backward compatibility
  lastUpdated?: number; // Timestamp when price was last updated
  minBuyPrice?: number; // Minimum buy increment (defaults to price if not specified)
}

export interface PortfolioData {
  assets: Asset[];
  currentPortfolioValue: number;
  additionalInvestment: number;
}

export interface AllocationResult {
  symbol: string;
  name: string;
  price: number;
  currentValue: number;
  targetAllocation: number;
  investmentAmount: number;
  shares: number;
  newValue: number;
  newPortfolioPercentage: number;
  newDifferenceFromTarget: number;
}
