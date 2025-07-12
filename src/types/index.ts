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
  price: number;
  currentValue: number;
  targetAllocation: number;
  investmentAmount: number;
  shares: number;
  newValue: number;
  newPortfolioPercentage: number;
  newDifferenceFromTarget: number;
}
