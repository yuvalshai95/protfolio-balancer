export interface Asset {
  symbol: string;
  name: string;
  price: number;
  targetAllocation: number;
  currentValue: number;
}

export interface PortfolioData {
  assets: Asset[];
  currentPortfolioValue: number;
  additionalInvestment: number;
}

export interface AllocationResult {
  symbol: string;
  name: string;
  currentValue: number;
  targetValue: number;
  recommendedInvestment: number;
  shares: number;
  price: number;
}